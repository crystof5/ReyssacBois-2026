"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { slugify } from "@/lib/slugify"
import { requireAdmin } from "@/lib/adminAuth"
import sanitizeHtml from "sanitize-html"

type ActionResult = { ok: true } | { ok: false; message: string }

function sanitizeRichTextHtml(input: string) {
  const clean = sanitizeHtml(input, {
    allowedTags: ["p", "br", "strong", "em", "u", "span", "a", "ul", "ol", "li"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    allowedStyles: {
      span: {
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = String(attribs.href ?? "").trim()
        const isInternal = href.startsWith("/")
        const safeHref =
          href.startsWith("/") ||
          /^https?:\/\//i.test(href) ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
            ? href
            : ""
        return {
          tagName,
          attribs: {
            href: safeHref,
            ...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" }),
          },
        }
      },
    },
  })
  return clean.trim()
}

function richHtmlToPlainText(html: string) {
  const withNewlines = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<\/\s*li\s*>/gi, "\n")

  const stripped = sanitizeHtml(withNewlines, { allowedTags: [], allowedAttributes: {} })
  return stripped.replace(/\n{3,}/g, "\n\n").trim()
}

async function ensureUniqueCategorySlug(slugBase: string, id: string) {
  let candidate = slugBase
  let i = 2
  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug: candidate,
        NOT: { id },
      },
      select: { id: true },
    })

    if (!existing) return candidate
    candidate = `${slugBase}-${i}`
    i += 1
  }
}

async function createDraftCategory(baseName: string) {
  // On crée un "draft" caché par défaut pour éviter toute apparition côté public.
  const created = await prisma.category.create({
    data: {
      name: baseName,
      slug: "draft",
      isVisible: false,
      description: null,
      imageUrl: null,
      parentId: null,
      sortOrder: 0,
    },
    select: { id: true },
  })

  const slugBase = slugify(baseName)
  const slug = await ensureUniqueCategorySlug(slugBase, created.id)
  await prisma.category.update({
    where: { id: created.id },
    data: { slug },
  })

  return created.id
}

export async function createCategoryAction() {
  await requireAdmin("/admin/categories")
  const id = await createDraftCategory("Nouvelle catégorie")

  revalidateTag("categoriesTree", "default")
  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/categories")
  redirect(`/admin/categories/${id}`)
}

export async function startSubCategoryFromCategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories")
  const parentId = String(formData.get("createChildParentId") ?? "").trim()
  if (!parentId) throw new Error("Parent manquant")

  const id = await createDraftCategory("Nouvelle sous-catégorie")

  revalidateTag("categoriesTree", "default")
  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/categories")
  redirect(`/admin/categories/${id}?prefillParentId=${encodeURIComponent(parentId)}`)
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin("/admin/categories")
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const slugInput = String(formData.get("slug") ?? "").trim()
  const descriptionHtmlRaw = String(formData.get("descriptionHtml") ?? "").trim()
  const imageUrl = String(formData.get("imageUrl") ?? "").trim()
  const parentIdRaw = String(formData.get("parentId") ?? "").trim()
  const isVisible = String(formData.get("isVisible") ?? "") === "1"
  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim()
  const sortOrder = Number.isFinite(Number(sortOrderRaw)) ? Number(sortOrderRaw) : 0

  if (!id) throw new Error("ID manquant")
  if (name.length < 2) throw new Error("Nom trop court")

  const current = await prisma.category.findUnique({
    where: { id },
    select: { slug: true },
  })
  if (!current) throw new Error("Catégorie introuvable")

  // Slug figé par défaut: si le champ slug n’est pas envoyé (input désactivé),
  // on conserve le slug actuel même si le nom change.
  const base = slugInput ? slugify(slugInput) : current.slug
  const slug = await ensureUniqueCategorySlug(base, id)
  const parentId = parentIdRaw ? parentIdRaw : null

  if (parentId === id) {
    throw new Error("Une catégorie ne peut pas être son propre parent.")
  }

  // Sécurité: empêche les cycles (ex: définir un descendant comme parent).
  if (parentId) {
    const links = await prisma.category.findMany({
      select: { id: true, parentId: true },
    })
    const parentById = new Map<string, string | null>(links.map((c) => [c.id, c.parentId]))
    let cur: string | null = parentId
    let guard = 0
    while (cur) {
      if (cur === id) {
        throw new Error("Parent invalide: une catégorie ne peut pas avoir l’un de ses descendants comme parent.")
      }
      guard += 1
      if (guard > 50) {
        throw new Error("Arborescence invalide (cycle détecté).")
      }
      cur = parentById.get(cur) ?? null
    }
  }

  const descriptionHtmlClean = descriptionHtmlRaw ? sanitizeRichTextHtml(descriptionHtmlRaw) : ""
  const descriptionPlain = descriptionHtmlClean ? richHtmlToPlainText(descriptionHtmlClean) : ""

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      // On conserve un champ texte (SEO / recherche / cartes) + un champ HTML (affichage riche).
      description: descriptionPlain || null,
      descriptionHtml: descriptionHtmlClean || null,
      imageUrl: imageUrl || null,
      parentId,
      isVisible,
      sortOrder,
    },
  })

  // Invalidation caches (SEO + navigation)
  revalidateTag("categoriesTree", "default")
  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${id}`)
  revalidatePath("/categories", "layout")
  revalidatePath("/produits", "layout")
  revalidatePath(`/categories/${slug}`)
  redirect(`/admin/categories/${id}?saved=1`)
}

export async function deleteCategoryIfOrphanAction(formData: FormData) {
  await requireAdmin("/admin/categories")
  const id = String(formData.get("id") ?? "").trim()
  if (!id) throw new Error("ID manquant")

  // Sécurité: on ne supprime que si la catégorie est réellement “vide”
  // (pas d'enfants, pas de produits rattachés).
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      _count: { select: { children: true, products: true } },
    },
  })
  if (!category) throw new Error("Catégorie introuvable")
  if (category._count.children > 0 || category._count.products > 0) {
    throw new Error("Impossible: catégorie non vide.")
  }

  await prisma.category.delete({ where: { id } })

  revalidateTag("categoriesTree", "default")
  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/categories")
  revalidatePath("/categories", "layout")
  revalidatePath("/produits", "layout")
  redirect("/admin/categories")
}

export async function detachProductsFromCategoryAction(
  categoryId: string,
  productIds: string[],
): Promise<ActionResult> {
  const catId = String(categoryId ?? "").trim()
  if (!catId) return { ok: false, message: "Catégorie manquante." }

  await requireAdmin(`/admin/categories/${catId}`)

  const unique = Array.from(new Set((productIds ?? []).map((x) => String(x).trim()).filter(Boolean)))
  if (unique.length === 0) return { ok: false, message: "Aucun produit sélectionné." }

  await prisma.productCategory.deleteMany({
    where: {
      categoryId: catId,
      productId: { in: unique },
    },
  })

  // Invalidation caches (SEO + navigation)
  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath(`/admin/categories/${catId}`)
  revalidatePath("/admin/produits")
  revalidatePath("/produits", "layout")
  revalidatePath("/categories", "layout")

  return { ok: true }
}

export async function detachCategoryChildrenIfEmptyAction(
  parentCategoryId: string,
  childCategoryIds: string[],
): Promise<ActionResult> {
  const parentId = String(parentCategoryId ?? "").trim()
  if (!parentId) return { ok: false, message: "Parent manquant." }

  await requireAdmin(`/admin/categories/${parentId}`)

  const unique = Array.from(new Set((childCategoryIds ?? []).map((x) => String(x).trim()).filter(Boolean)))
  if (unique.length === 0) return { ok: false, message: "Aucune sous-catégorie sélectionnée." }

  // Vérifie que ce sont bien des enfants du parent + qu'elles sont vides.
  const children = await prisma.category.findMany({
    where: { id: { in: unique } },
    select: {
      id: true,
      parentId: true,
      _count: { select: { children: true, products: true } },
    },
  })

  if (children.length !== unique.length) {
    return { ok: false, message: "Sous-catégories introuvables." }
  }

  if (children.some((c) => c.parentId !== parentId)) {
    return { ok: false, message: "La sélection contient des sous-catégories hors de ce parent." }
  }

  const notEmpty = children.filter((c) => (c._count.children ?? 0) > 0 || (c._count.products ?? 0) > 0)
  if (notEmpty.length > 0) {
    return {
      ok: false,
      message:
        "Détachage impossible: certaines sous-catégories ne sont pas vides (elles ont des sous-catégories ou des produits).",
    }
  }

  await prisma.$transaction(
    unique.map((id) =>
      prisma.category.update({
        where: { id },
        data: { parentId: null, sortOrder: 0 },
      }),
    ),
  )

  // Invalidation caches (SEO + navigation)
  revalidateTag("categoriesTree", "default")
  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath(`/admin/categories/${parentId}`)
  revalidatePath("/admin/categories")
  revalidatePath("/categories", "layout")
  revalidatePath("/produits", "layout")

  return { ok: true }
}


