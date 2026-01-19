import { prisma } from "@/lib/prisma"

type CategoryNode = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  isVisible: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  children: CategoryNode[]
}

export async function getCategoriesTree() {
  const categories = await prisma.category.findMany({
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

  const map = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  map.forEach((cat) => {
    if (cat.parentId) {
      map.get(cat.parentId)?.children.push(cat)
    } else {
      roots.push(cat)
    }
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
}
