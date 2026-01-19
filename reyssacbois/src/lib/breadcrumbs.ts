import { prisma } from "@/lib/prisma"
import type { Category } from "@prisma/client"
import { unstable_cache } from "next/cache"

async function getVisibleCategoryPath(leaf: Category): Promise<Category[] | null> {
  const path: Category[] = []
  let current: Category | null = leaf
  const visited = new Set<string>()

  while (current) {
    if (visited.has(current.id)) return null
    visited.add(current.id)

    if (!current.isVisible) return null

    path.unshift(current)

    if (!current.parentId) break

    const parent: Category | null = await prisma.category.findUnique({
      where: { id: current.parentId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        parentId: true,
        isVisible: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!parent) break
    current = parent
  }

  return path
}

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
    if (!product.isVisible) {
      return null
    }

    // On autorise les produits sans catégorie : breadcrumb = "Produits" uniquement.
    // (Mais il restera visible uniquement si product.isVisible=true)
    if (product.categories.length === 0) {
      return {
        product,
        categories: [] as Category[],
      }
    }

    // Plusieurs catégories possibles: on prend la première dont la chaîne d'ancêtres est visible.
    const candidatePaths: Category[][] = []
    for (const rel of product.categories) {
      const leaf = rel.category
      if (!leaf) continue
      const path = await getVisibleCategoryPath(leaf)
      if (path && path.length > 0) candidatePaths.push(path)
    }

    if (candidatePaths.length === 0) {
      // Produit rattaché uniquement à des catégories cachées (directes ou via parent)
      return null
    }

    const scoreOf = (path: Category[]) => {
      const root = path[0]
      const leaf = path[path.length - 1]
      return [
        root?.sortOrder ?? 0,
        path.length,
        leaf?.sortOrder ?? 0,
        String(leaf?.name ?? ""),
      ] as const
    }

    candidatePaths.sort((a, b) => {
      const sa = scoreOf(a)
      const sb = scoreOf(b)
      if (sa[0] !== sb[0]) return sa[0] - sb[0]
      if (sa[1] !== sb[1]) return sa[1] - sb[1]
      if (sa[2] !== sb[2]) return sa[2] - sb[2]
      return sa[3].localeCompare(sb[3], "fr")
    })

    const categoriesPath = candidatePaths[0]

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

    return await getVisibleCategoryPath(category)
  },
  ["categoryBreadcrumb"],
  { revalidate: 300 }
)

export async function getCategoryBreadcrumb(categorySlug: string) {
  return await getCategoryBreadcrumbCached(categorySlug)
}
