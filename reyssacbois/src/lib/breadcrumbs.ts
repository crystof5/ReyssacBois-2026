import { prisma } from "@/lib/prisma"
import type { Category } from "@prisma/client"

export async function getProductBreadcrumb(productSlug: string) {
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  })

  if (!product) {
    return null
  }

  // On autorise les produits sans catégorie : breadcrumb = "Produits" uniquement.
  if (product.categories.length === 0) {
    return {
      product,
      categories: [] as Category[],
    }
  }

  const categoriesPath: Category[] = []

  let currentCategory = product.categories[0].category

  while (currentCategory) {
    categoriesPath.unshift(currentCategory)

    if (!currentCategory.parentId) break

    const parent = await prisma.category.findUnique({
      where: { id: currentCategory.parentId },
    })

    if (!parent) break

    currentCategory = parent
  }

  return {
    product,
    categories: categoriesPath,
  }
}

export async function getCategoryBreadcrumb(categorySlug: string) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  })

  if (!category) {
    return null
  }

  const categoriesPath: Category[] = []
  let currentCategory: Category | null = category

  while (currentCategory) {
    categoriesPath.unshift(currentCategory)

    if (!currentCategory.parentId) break

    const parent = await prisma.category.findUnique({
      where: { id: currentCategory.parentId },
    })

    if (!parent) break

    currentCategory = parent
  }

  return categoriesPath
}
