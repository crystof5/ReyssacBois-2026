import { prisma } from "@/lib/prisma"

export async function getAdminCategories() {
  return await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: true,
      _count: {
        select: {
          children: true,
          products: true, // ProductCategory rows
        },
      },
    },
  })
}


