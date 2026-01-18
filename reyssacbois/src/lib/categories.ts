import { prisma } from "@/lib/prisma"

export async function getCategoriesTree() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  const map = new Map<string, any>()
  const roots: any[] = []

  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] })
  })

  map.forEach((cat) => {
    if (cat.parentId) {
      map.get(cat.parentId)?.children.push(cat)
    } else {
      roots.push(cat)
    }
  })

  return roots
}
