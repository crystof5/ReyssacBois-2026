"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { slugify } from "@/lib/slugify"
import { requireAdmin } from "@/lib/adminAuth"

type ActionResult = { ok: true } | { ok: false; message: string }

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
  const description = String(formData.get("description") ?? "").trim()
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

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || null,
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


