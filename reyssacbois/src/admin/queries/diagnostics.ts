import { prisma } from "@/lib/prisma"

export type DbDiagnostics = {
  database: string | null
  schema: string | null
  categoriesTotal: number
  categoriesParents: number
  categoriesChildren: number
  productsTotal: number
}

export async function getDbDiagnostics(): Promise<DbDiagnostics> {
  const [dbRow] = await prisma.$queryRaw<Array<{ db: string | null; schema: string | null }>>`
    SELECT current_database() AS db, current_schema() AS schema
  `

  const [categoriesTotal, categoriesParents, categoriesChildren, productsTotal] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where: { parentId: null } }),
    prisma.category.count({ where: { parentId: { not: null } } }),
    prisma.product.count(),
  ])

  return {
    database: dbRow?.db ?? null,
    schema: dbRow?.schema ?? null,
    categoriesTotal,
    categoriesParents,
    categoriesChildren,
    productsTotal,
  }
}

