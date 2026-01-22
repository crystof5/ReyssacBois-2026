"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/adminAuth"

type ActionResult = { ok: true } | { ok: false; message: string }

function normalizeIds(ids: string[]) {
  const cleaned = ids.map((s) => String(s || "").trim()).filter(Boolean)
  const unique = Array.from(new Set(cleaned))
  return unique
}

export async function reorderTopCategoriesAction(ids: string[]): Promise<ActionResult> {
  await requireAdmin("/admin/categories")

  const unique = normalizeIds(ids)
  if (unique.length === 0) return { ok: false, message: "Liste vide." }

  // Vérifie que ce sont bien des catégories parent (parentId null)
  const cats = await prisma.category.findMany({
    where: { id: { in: unique } },
    select: { id: true, parentId: true },
  })

  if (cats.length !== unique.length) return { ok: false, message: "Catégories introuvables." }
  if (cats.some((c) => c.parentId != null)) {
    return { ok: false, message: "Seulement les catégories parent peuvent être réordonnées ici." }
  }

  await prisma.$transaction(
    unique.map((id, idx) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  )

  revalidatePath("/admin/categories")
  revalidatePath("/categories", "layout")
  revalidatePath("/produits", "layout")
  return { ok: true }
}

export async function reorderCategoryChildrenAction(
  parentId: string,
  childIds: string[]
): Promise<ActionResult> {
  await requireAdmin("/admin/categories")

  const parent = String(parentId || "").trim()
  if (!parent) return { ok: false, message: "Parent manquant." }
  const unique = normalizeIds(childIds)
  if (unique.length === 0) return { ok: false, message: "Liste vide." }

  const cats = await prisma.category.findMany({
    where: { id: { in: unique } },
    select: { id: true, parentId: true },
  })
  if (cats.length !== unique.length) return { ok: false, message: "Sous-catégories introuvables." }
  if (cats.some((c) => c.parentId !== parent)) {
    return { ok: false, message: "La liste contient des catégories hors de ce parent." }
  }

  await prisma.$transaction(
    unique.map((id, idx) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  )

  revalidatePath(`/admin/categories/${parent}`)
  revalidatePath("/admin/categories")
  revalidatePath("/categories", "layout")
  revalidatePath("/produits", "layout")
  return { ok: true }
}

export async function reorderProductsAction(ids: string[]): Promise<ActionResult> {
  await requireAdmin("/admin/produits")

  const unique = normalizeIds(ids)
  if (unique.length === 0) return { ok: false, message: "Liste vide." }

  const products = await prisma.product.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  })
  if (products.length !== unique.length) return { ok: false, message: "Produits introuvables." }

  await prisma.$transaction(
    unique.map((id, idx) =>
      prisma.product.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  )

  revalidatePath("/admin/produits")
  revalidatePath("/produits", "layout")
  revalidatePath("/categories", "layout")
  return { ok: true }
}

export async function reorderCategoryProductsAction(
  categoryId: string,
  productIds: string[]
): Promise<ActionResult> {
  await requireAdmin("/admin/categories")

  const category = String(categoryId || "").trim()
  if (!category) return { ok: false, message: "Catégorie manquante." }
  const unique = normalizeIds(productIds)
  if (unique.length === 0) return { ok: false, message: "Liste vide." }

  const products = await prisma.product.findMany({
    where: {
      id: { in: unique },
      categories: { some: { categoryId: category } },
    },
    select: { id: true },
  })
  if (products.length !== unique.length) {
    return { ok: false, message: "La liste contient des produits hors de cette catégorie." }
  }

  await prisma.$transaction(
    unique.map((id, idx) =>
      prisma.product.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  )

  revalidatePath(`/admin/categories/${category}`)
  revalidatePath("/produits", "layout")
  revalidatePath("/categories", "layout")
  return { ok: true }
}

