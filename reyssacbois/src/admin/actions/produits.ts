"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { slugify } from "@/lib/slugify"

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
      isVisible: false,
      description: null,
      imageUrl: null,
      sortOrder: 0,
      section: null,
      length: null,
      species: null,
      type: null,
      standard: null,
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

export async function createProduitAction() {
  const id = await createDraftProduct("Nouveau produit")

  revalidateTag("breadcrumbs", "default")
  revalidateTag("sitemap", "default")
  revalidateTag("productCanonical", "default")

  revalidatePath("/admin/produits")
  redirect(`/admin/produits/${id}`)
}

export async function startProduitFromCategoryAction(formData: FormData) {
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
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const slugInput = String(formData.get("slug") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const imageUrl = String(formData.get("imageUrl") ?? "").trim()
  const isVisible = String(formData.get("isVisible") ?? "") === "1"
  const sortOrderRaw = String(formData.get("sortOrder") ?? "").trim()
  const sortOrder = Number.isFinite(Number(sortOrderRaw)) ? Number(sortOrderRaw) : 0

  const section = String(formData.get("section") ?? "").trim()
  const length = String(formData.get("length") ?? "").trim()
  const species = String(formData.get("species") ?? "").trim()
  const type = String(formData.get("type") ?? "").trim()
  const standard = String(formData.get("standard") ?? "").trim()

  const categoryIds = formData.getAll("categoryIds").map((v) => String(v))

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

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
      isVisible,
      sortOrder,
      section: section || null,
      length: length || null,
      species: species || null,
      type: type || null,
      standard: standard || null,
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
  redirect(`/admin/produits/${id}?saved=1`)
}

export async function deleteProduitIfOrphanAction(formData: FormData) {
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


