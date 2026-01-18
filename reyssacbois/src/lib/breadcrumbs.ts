import { prisma } from "@/lib/prisma"

export async function getCategoryBreadcrumb(slug: string) {
  const path = []

  let current = await prisma.category.findUnique({
    where: { slug },
  })

  while (current) {
    path.unshift(current)
    if (!current.parentId) break

    current = await prisma.category.findUnique({
      where: { id: current.parentId },
    })
  }

  return path
}
