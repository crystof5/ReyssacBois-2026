import { prisma } from "@/lib/prisma"
import type { Category } from "@prisma/client"
import { unstable_cache } from "next/cache"

const getProductBreadcrumbCached = unstable_cache(
  async (productSlug: string) => {
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

    const parent: Category | null = await prisma.category.findUnique({
      where: { id: currentCategory.parentId },
    })

    if (!parent) break

    currentCategory = parent
  }

  return {
    product,
    categories: categoriesPath,
  }
  },
  ["productBreadcrumb"],
  { revalidate: 300 }
)

export async function getProductBreadcrumb(productSlug: string) {
  return await getProductBreadcrumbCached(productSlug)
}

const getCategoryBreadcrumbCached = unstable_cache(
  async (categorySlug: string) => {
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

      const parent: Category | null = await prisma.category.findUnique({
        where: { id: currentCategory.parentId },
      })

      if (!parent) break

      currentCategory = parent
    }

    return categoriesPath
  },
  ["categoryBreadcrumb"],
  { revalidate: 300 }
)

export async function getCategoryBreadcrumb(categorySlug: string) {
  return await getCategoryBreadcrumbCached(categorySlug)
}
