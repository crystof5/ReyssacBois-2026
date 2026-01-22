import { prisma } from "@/lib/prisma"

export async function getAdminProduits() {
  const produits = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          categories: true, // ProductCategory rows
        },
      },
    },
  })

  // Défensif: détecte d’éventuels liens cassés ProductCategory -> Category.
  // (Normalement impossible avec les FK Postgres, mais utile si la DB a été modifiée à la main.)
  const relCounts = await prisma.$queryRaw<
    Array<{ productId: string; validCount: bigint; totalCount: bigint }>
  >`
    SELECT
      pc."productId" as "productId",
      COUNT(c.id) as "validCount",
      COUNT(*) as "totalCount"
    FROM "ProductCategory" pc
    LEFT JOIN "Category" c ON c.id = pc."categoryId"
    GROUP BY pc."productId"
  `

  const byProductId = new Map(
    relCounts.map((r) => [
      r.productId,
      {
        valid: Number(r.validCount ?? 0),
        total: Number(r.totalCount ?? 0),
      },
    ])
  )

  return produits.map((p) => {
    const c = byProductId.get(p.id) ?? { valid: 0, total: 0 }
    return Object.assign(p, {
      __validCategoryCount: c.valid,
      __totalCategoryLinks: c.total,
      __hasBrokenCategoryLinks: c.total > c.valid,
    })
  })
}


