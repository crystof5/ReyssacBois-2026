import { prisma } from "@/lib/prisma"

export type HealthItem = { id: string; name: string; isVisible: boolean; hint?: string }

export type CatalogHealth = {
  orphanProducts: HealthItem[]
  orphanCategories: HealthItem[]
  emptyCategories: HealthItem[]
}

/**
 * Points de contrôle du catalogue pour le tableau de bord admin.
 * - produit orphelin : rattaché à aucune catégorie (invisible dans le catalogue public)
 * - catégorie orpheline : parent introuvable, ou racine non marquée "principale" (absente du menu)
 * - catégorie vide : ni produit ni sous-catégorie
 */
export async function getCatalogHealth(): Promise<CatalogHealth> {
  const [categories, orphanProducts] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
        isTopCategory: true,
        isVisible: true,
        _count: { select: { products: true, children: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { categories: { none: {} } },
      select: { id: true, name: true, isVisible: true },
      orderBy: { name: "asc" },
    }),
  ])

  const byId = new Map(categories.map((c) => [c.id, c]))

  const orphanCategories: HealthItem[] = []
  for (const c of categories) {
    if (c.parentId && !byId.has(c.parentId)) {
      orphanCategories.push({ id: c.id, name: c.name, isVisible: c.isVisible, hint: "Parent introuvable" })
    } else if (!c.parentId && !c.isTopCategory) {
      orphanCategories.push({ id: c.id, name: c.name, isVisible: c.isVisible, hint: "Racine absente du menu" })
    }
  }

  const emptyCategories: HealthItem[] = categories
    .filter((c) => c._count.products === 0 && c._count.children === 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      isVisible: c.isVisible,
      hint: c.parentId ? byId.get(c.parentId)?.name : undefined,
    }))

  return { orphanProducts, orphanCategories, emptyCategories }
}
