"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { slugify } from "./slug"

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

export async function updateCategoryAction(formData: FormData) {
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
  revalidateTag("categoriesTree")
  revalidateTag("breadcrumbs")
  revalidateTag("sitemap")

  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${id}`)
  revalidatePath("/categories", "layout")
  revalidatePath("/produits", "layout")
  revalidatePath(`/categories/${slug}`)
  redirect("/admin/categories")
}


