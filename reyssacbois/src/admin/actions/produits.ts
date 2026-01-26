"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { slugify } from "@/lib/slugify"
import { requireAdmin } from "@/lib/adminAuth"
import sanitizeHtml from "sanitize-html"

async function ensureUniqueProductSlug(slugBase: string, id: string) {
  let candidate = slugBase
  let i = 2
  while (true) {
    const existing = await prisma.product.findFirst({
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

async function createDraftProduct(baseName: string) {
  const created = await prisma.product.create({
    data: {
      name: baseName,
      slug: "draft",
      // Par défaut, un nouveau produit est visible (modifiable ensuite dans la fiche).
      isVisible: true,
      description: null,
      descriptionHtml: null,
      imageUrl: null,
      sortOrder: 0,
      section: null,
      length: null,
      width: null,
      type: null,
    },
    select: { id: true },
  })

  const slugBase = slugify(baseName)
  const slug = await ensureUniqueProductSlug(slugBase, created.id)
  await prisma.product.update({
    where: { id: created.id },
    data: { slug },
  })

  return created.id
}

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

export async function createProduitAction() {
  await requireAdmin("/admin/produits")
  const id = await createDraftProduct("Nouveau produit")

  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/produits")
  redirect(`/admin/produits/${id}`)
}

export async function startProduitFromCategoryAction(formData: FormData) {
  await requireAdmin("/admin/produits")
  const categoryId = String(formData.get("categoryId") ?? "").trim()
  if (!categoryId) throw new Error("Catégorie manquante")

  const id = await createDraftProduct("Nouveau produit")

  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/produits")
  redirect(`/admin/produits/${id}?prefillCategoryId=${encodeURIComponent(categoryId)}`)
}

export async function updateProduitAction(formData: FormData) {
  await requireAdmin("/admin/produits")
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const slugInput = String(formData.get("slug") ?? "").trim()
  const descriptionHtmlRaw = String(formData.get("descriptionHtml") ?? "").trim()
  const imageUrl = String(formData.get("imageUrl") ?? "").trim()
  const isVisible = String(formData.get("isVisible") ?? "") === "1"
  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim()
  const sortOrder = Number.isFinite(Number(sortOrderRaw)) ? Number(sortOrderRaw) : 0

  const section = String(formData.get("section") ?? "").trim()
  const length = String(formData.get("length") ?? "").trim()
  const width = String(formData.get("width") ?? "").trim()
  const type = String(formData.get("type") ?? "").trim()

  const categoryIds = Array.from(
    new Set(formData.getAll("categoryIds").map((v) => String(v).trim()).filter(Boolean)),
  )

  if (!id) throw new Error("ID manquant")
  if (name.length < 2) throw new Error("Nom trop court")

  const current = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  })
  if (!current) throw new Error("Produit introuvable")

  // Slug figé par défaut (voir catégorie): si non envoyé, on conserve l’existant.
  const base = slugInput ? slugify(slugInput) : current.slug
  const slug = await ensureUniqueProductSlug(base, id)

  const descriptionHtmlClean = descriptionHtmlRaw ? sanitizeRichTextHtml(descriptionHtmlRaw) : ""
  const descriptionPlain = descriptionHtmlClean ? richHtmlToPlainText(descriptionHtmlClean) : ""

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description: descriptionPlain || null,
      descriptionHtml: descriptionHtmlClean || null,
      imageUrl: imageUrl || null,
      isVisible,
      sortOrder,
      section: section || null,
      length: length || null,
      width: width || null,
      type: type || null,
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
    },
  })

  // Invalidation caches (SEO + navigation)
  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/produits")
  revalidatePath(`/admin/produits/${id}`)
  revalidatePath("/produits", "layout")
  revalidatePath(`/produits/${slug}`)
  revalidatePath("/categories", "layout")
  redirect(
    `/admin/produits/${id}?saved=1${
      categoryIds.length === 1 ? `&prefillCategoryId=${encodeURIComponent(categoryIds[0])}` : ""
    }`,
  )
}

export async function deleteProduitIfOrphanAction(formData: FormData) {
  await requireAdmin("/admin/produits")
  const id = String(formData.get("id") ?? "").trim()
  if (!id) throw new Error("ID manquant")

  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } })
  if (!product) throw new Error("Produit introuvable")

  // Défensif: compter les catégories "valides" (join réel sur Category).
  const rows = await prisma.$queryRaw<Array<{ validCount: bigint }>>`
    SELECT COUNT(c.id) as "validCount"
    FROM "ProductCategory" pc
    LEFT JOIN "Category" c ON c.id = pc."categoryId"
    WHERE pc."productId" = ${id}
  `
  const validCount = Number(rows?.[0]?.validCount ?? 0)
  if (validCount > 0) {
    throw new Error("Impossible: produit rattaché à une catégorie.")
  }

  // On nettoie aussi les éventuelles lignes de liaison (liens cassés / anciens imports).
  await prisma.productCategory.deleteMany({ where: { productId: id } })

  await prisma.product.delete({ where: { id } })

  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/produits")
  revalidatePath("/produits", "layout")
  revalidatePath("/categories", "layout")
  redirect("/admin/produits")
}


