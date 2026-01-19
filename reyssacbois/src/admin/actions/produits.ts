"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { slugify } from "./slug"

async function ensureUniqueProductSlug(slugBase: string, id: string) {
  let candidate = slugBase
  let i = 2
  // eslint-disable-next-line no-constant-condition
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

export async function updateProduitAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const slugInput = String(formData.get("slug") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const imageUrl = String(formData.get("imageUrl") ?? "").trim()

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

  revalidatePath("/admin/produits")
  revalidatePath(`/admin/produits/${id}`)
  redirect("/admin/produits")
}


