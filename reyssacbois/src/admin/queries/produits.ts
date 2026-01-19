import { prisma } from "@/lib/prisma"

export async function getAdminProduits() {
  return await prisma.product.findMany({
    orderBy: [{ name: "asc" }],
    include: {
      _count: {
        select: {
          categories: true, // ProductCategory rows
        },
      },
    },
  })
}


