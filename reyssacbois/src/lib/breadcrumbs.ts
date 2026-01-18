import { prisma } from "@/lib/prisma"

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

  if (!product || product.categories.length === 0) {
    return null
  }

  const categoriesPath = []

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
