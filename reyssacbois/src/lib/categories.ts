import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"

type CategoryNode = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  isVisible: boolean
  sortOrder: number
  isTopCategory: boolean
  createdAt: Date
  updatedAt: Date
  /** Nombre de produits visibles rattachés directement. */
  productCount: number
  children: CategoryNode[]
}

type CategoryRow = Omit<CategoryNode, "children" | "productCount"> & {
  _count: { products: number }
}

const CATEGORIES_TREE_TAG = "categoriesTree"

const getCategoriesTreeCached = unstable_cache(
  async () => {
    const categorySelect = {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      parentId: true,
      isVisible: true,
      sortOrder: true,
      isTopCategory: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { products: { where: { product: { isVisible: true } } } } },
    } satisfies Prisma.CategorySelect

    const categories = (await prisma.category.findMany({
      select: categorySelect,
    })) as unknown as CategoryRow[]

    const map = new Map<string, CategoryNode>()
    const roots: CategoryNode[] = []

    for (const cat of categories) {
      const { _count, ...rest } = cat
      map.set(cat.id, { ...rest, productCount: _count.products, children: [] })
    }

    map.forEach((cat) => {
      if (cat.parentId) {
        map.get(cat.parentId)?.children.push(cat)
        return
      }

      // Racines côté public: on n’affiche dans le menu que les catégories marquées “principales”.
      // Les autres catégories sans parent restent accessibles par URL (si on y navigue),
      // mais ne polluent pas le menu.
      if (cat.isTopCategory) roots.push(cat)
    })

  // Visibilité effective: une catégorie est visible si elle-même est visible
  // ET tous ses ancêtres sont visibles.
  const visibleMemo = new Map<string, boolean>()
  const isVisibleEffective = (id: string): boolean => {
    const memo = visibleMemo.get(id)
    if (memo !== undefined) return memo

    const cat = map.get(id)
    if (!cat) {
      visibleMemo.set(id, false)
      return false
    }
    if (!cat.isVisible) {
      visibleMemo.set(id, false)
      return false
    }
    if (!cat.parentId) {
      visibleMemo.set(id, true)
      return true
    }
    const ok = isVisibleEffective(cat.parentId)
    visibleMemo.set(id, ok)
    return ok
  }

  const sortFn = (a: CategoryNode, b: CategoryNode) => {
    const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (byOrder !== 0) return byOrder
    return String(a.name).localeCompare(String(b.name), "fr")
  }

  const filterAndSortTree = (nodes: CategoryNode[]): CategoryNode[] => {
    return nodes
      .filter((n) => isVisibleEffective(n.id))
      .map((n) => ({
        ...n,
        children: filterAndSortTree(n.children ?? []),
      }))
      .sort(sortFn)
  }

    return filterAndSortTree(roots)
  },
  ["categoriesTree"],
  {
    revalidate: 60 * 30,
    tags: [CATEGORIES_TREE_TAG],
  }
)

export async function getCategoriesTree() {
  return await getCategoriesTreeCached()
}
