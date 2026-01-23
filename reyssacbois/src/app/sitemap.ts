import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { unstable_cache } from "next/cache"

// Route "SEO" très crawlée: on autorise le cache Next (en plus du `unstable_cache` interne).
// Note (Next 16 + Turbopack): les exports de config de segment doivent être des littéraux.
export const revalidate = 21600 // 6h

type CategoryLite = {
  id: string
  slug: string
  parentId: string | null
  isVisible: boolean
  updatedAt: Date
}

function isEffectivelyVisibleCategory(
  id: string,
  byId: Map<string, CategoryLite>,
  memo: Map<string, boolean>,
): boolean {
  const cached = memo.get(id)
  if (cached !== undefined) return cached

  const visited = new Set<string>()
  let current: string | null = id
  while (current) {
    if (visited.has(current)) {
      memo.set(id, false)
      return false
    }
    visited.add(current)

    const cat = byId.get(current)
    if (!cat || !cat.isVisible) {
      memo.set(id, false)
      return false
    }
    current = cat.parentId
  }

  memo.set(id, true)
  return true
}

const buildSitemap = unstable_cache(
  async (): Promise<MetadataRoute.Sitemap> => {
      const [categories, products] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        parentId: true,
        isVisible: true,
        updatedAt: true,
      },
    }),
    prisma.product.findMany({
      where: { isVisible: true },
      select: {
        name: true,
        slug: true,
        updatedAt: true,
        createdAt: true,
        sortOrder: true,
        section: true,
        length: true,
        species: true,
        type: true,
        standard: true,
        categories: { select: { categoryId: true } },
      },
    }),
  ])

  const byId = new Map<string, CategoryLite>(categories.map((c) => [c.id, c]))
  const memo = new Map<string, boolean>()

  const effectivelyVisibleCategoryIds = new Set<string>()
  for (const c of categories) {
    if (!c.isVisible) continue
    if (isEffectivelyVisibleCategory(c.id, byId, memo)) {
      effectivelyVisibleCategoryIds.add(c.id)
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/produits"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/categories"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/mentions-legales"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/politique-de-confidentialite"), changeFrequency: "yearly", priority: 0.2 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((c) => effectivelyVisibleCategoryIds.has(c.id))
    .map((c) => ({
      url: absoluteUrl(`/categories/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }))

  const eligibleProducts = products.filter((p) => {
    // produit sans catégorie -> autorisé (visible s'il estVisible=true)
    if (!p.categories.length) return true
    // au moins une catégorie (et sa chaîne) visible
    return p.categories.some((rel) => effectivelyVisibleCategoryIds.has(rel.categoryId))
  })

  const normalize = (v: string | null | undefined) =>
    (v ?? "").trim().toLowerCase().replace(/\s+/g, " ")

  const seoKeyOf = (p: (typeof eligibleProducts)[number]) =>
    [
      normalize(p.name),
      normalize(p.section),
      normalize(p.length),
      normalize(p.species),
      normalize(p.type),
      normalize(p.standard),
    ].join("|")

  // Déduplication: on n'inclut qu'un “canonique” par groupe de produits identiques.
  const bestByKey = new Map<string, (typeof eligibleProducts)[number]>()
  for (const p of eligibleProducts) {
    const key = seoKeyOf(p)
    const prev = bestByKey.get(key)
    if (!prev) {
      bestByKey.set(key, p)
      continue
    }

    const score = (x: (typeof eligibleProducts)[number]) => [
      x.sortOrder ?? 0,
      x.createdAt?.getTime?.() ?? 0,
      x.slug,
    ] as const

    const a = score(p)
    const b = score(prev)
    const better =
      a[0] < b[0] ||
      (a[0] === b[0] && a[1] < b[1]) ||
      (a[0] === b[0] && a[1] === b[1] && a[2].localeCompare(b[2], "fr") < 0)

    if (better) bestByKey.set(key, p)
  }

  const canonicalProducts = Array.from(bestByKey.values())

  const productPages: MetadataRoute.Sitemap = canonicalProducts.map((p) => ({
    url: absoluteUrl(`/produits/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

    return [...staticPages, ...categoryPages, ...productPages]
  },
  ["sitemap"],
  {
    // cache long + invalidation via admin (revalidateTag("sitemap"))
    revalidate: 60 * 60 * 6, // 6h
    tags: ["sitemap"],
  }
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await buildSitemap()
}

