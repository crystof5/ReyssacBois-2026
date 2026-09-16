import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getProductBreadcrumb } from "@/lib/breadcrumbs"
import Link from "next/link"
import type { Metadata } from "next"
import { buildDescription } from "@/lib/meta"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { getCategoriesTree } from "@/lib/categories"
import ProductCard from "@/components/ProductCard"
import ItemDetail from "@/components/catalog/ItemDetail"
import { productSeoLabel } from "@/lib/productSeo"

function normalizeSeoKeyPart(v: string | null | undefined) {
  return (v ?? "").trim().toLowerCase().replace(/\s+/g, " ")
}

function productSeoKey(p: {
  name: string
  section?: string | null
  length?: string | null
  width?: string | null
  type?: string | null
}) {
  // Clé “dédup” : si deux produits ont la même clé, on les considère identiques côté SEO.
  // (Assez stricte pour éviter de fusionner des produits réellement différents.)
  return [
    normalizeSeoKeyPart(p.name),
    normalizeSeoKeyPart(p.section),
    normalizeSeoKeyPart(p.length),
    normalizeSeoKeyPart(p.width),
    normalizeSeoKeyPart(p.type),
  ].join("|")
}

const getCanonicalProductSlugCached = unstable_cache(
  async (current: {
  slug: string
  name: string
  section?: string | null
  length?: string | null
  width?: string | null
  type?: string | null
}) => {
  // Catégories "effectivement visibles" (visibilité + chaîne d'ancêtres)
  // via le cache serveur `categoriesTree`.
  const categoriesTree = await getCategoriesTree()
  const visibleCategoryIds = new Set<string>()
  const walk = (nodes: unknown[]) => {
    for (const n of nodes) {
      if (!n || typeof n !== "object") continue
      const id = (n as { id?: unknown }).id
      if (typeof id === "string") visibleCategoryIds.add(id)
      const children = (n as { children?: unknown }).children
      if (Array.isArray(children)) walk(children)
    }
  }
  if (Array.isArray(categoriesTree)) walk(categoriesTree)

  // Cherche les “doublons” stricts (même nom + mêmes champs techniques)
  // puis choisit une URL canonique stable.
  const candidates = await prisma.product.findMany({
    where: {
      isVisible: true,
      name: { equals: current.name, mode: "insensitive" },
      section: { equals: current.section ?? null },
      length: { equals: current.length ?? null },
      width: { equals: current.width ?? null },
      type: { equals: current.type ?? null },
    },
    select: {
      slug: true,
      sortOrder: true,
      createdAt: true,
      categories: { select: { categoryId: true } },
    },
  })

  // Si ça ne “matche” pas bien pour une raison quelconque, fallback sur la clé JS.
  const key = productSeoKey(current)
  const filtered = candidates.filter((c) => {
    // on ne peut pas recalculer la clé exacte sans les champs, mais on garde un garde-fou
    // (si la query DB est “large”, on ne casse pas).
    return key.length > 0 && !!c.slug
  })

  const sorted = (filtered.length ? filtered : candidates).slice().sort((a, b) => {
    const ao = a.sortOrder ?? 0
    const bo = b.sortOrder ?? 0
    if (ao !== bo) return ao - bo
    const at = a.createdAt?.getTime?.() ?? 0
    const bt = b.createdAt?.getTime?.() ?? 0
    if (at !== bt) return at - bt
    return a.slug.localeCompare(b.slug, "fr")
  })

  // Très important : le canonique doit être une page réellement “publique”.
  // On évite de rappeler `getProductBreadcrumb()` N fois (trop coûteux) en testant juste
  // si au moins une catégorie rattachée est "effectivement visible" (ou zéro catégorie).
  const canonical = sorted.find((c) => {
    if (!c.categories?.length) return true
    return c.categories.some((rel) => visibleCategoryIds.has(rel.categoryId))
  })

  return canonical?.slug ?? current.slug
  },
  ["productCanonical"],
  {
    revalidate: 60 * 60 * 6, // 6h
    tags: ["productCanonical"],
  }
)

const getSiblingProductsCached = unstable_cache(
  async (categoryId: string, excludeId: string) => {
    return await prisma.product.findMany({
      where: { isVisible: true, id: { not: excludeId }, categories: { some: { categoryId } } },
      select: { id: true, name: true, slug: true, description: true, imageUrl: true, section: true, width: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 3,
    })
  },
  ["productSiblings"],
  { revalidate: 60 * 30, tags: ["sitemap"] },
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!slug) {
    return { robots: { index: false, follow: false } }
  }

  const data = await getProductBreadcrumb(slug)
  if (!data) {
    return { robots: { index: false, follow: false } }
  }

  const { product, categories } = data
  const categoryHint = categories.at(-1)?.name

  const canonicalSlug = await getCanonicalProductSlugCached({
    slug: product.slug,
    name: product.name,
    section: product.section,
    length: product.length,
    width: product.width,
    type: product.type,
  })

  const label = productSeoLabel(product.name, categoryHint)
  const title = `${label} à Agen`
  const description = buildDescription(
    `${label} disponible chez Reyssac Bois à Boé, près d'Agen. ${product.description ?? ""} Conseil, découpe et livraison en Lot-et-Garonne.`,
    "",
  )

  const isCanonical = canonicalSlug === product.slug
  const canonicalPath = `/produits/${canonicalSlug}`

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: isCanonical ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : undefined,
    },
  }
}

export default async function ProduitPage({
  params,
}: {
  params: Promise<{ slug?: string }>
}) {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

  const data = await getProductBreadcrumb(slug)

  if (!data) {
    notFound()
  }

  const { product, categories } = data
  const category = categories.at(-1)
  const siblings = category ? await getSiblingProductsCached(category.id, product.id) : []


  const specs = [
    { label: "Section", value: product.section },
    { label: "Longueur", value: product.length },
    { label: "Largeur", value: product.width },
    { label: "Type", value: product.type },
  ].filter((s): s is { label: string; value: string } => Boolean(s.value?.trim()))

  return (
    <div>
      <div className="hidden md:block">
        <Breadcrumb
          items={[
            { id: "catalogue", name: "Catalogue", href: "/produits" },
            ...categories.map((c) => ({
              id: c.id,
              name: c.name,
              href: `/categories/${c.slug}`,
            })),
            {
              id: product.id,
              name: product.name,
              href: `/produits/${product.slug}`,
            },
          ]}
        />
      </div>

      <ItemDetail
        title={product.name}
        imageUrl={product.imageUrl}
        description={product.description}
        descriptionHtml={product.descriptionHtml}
        specs={specs}
        parent={category ? { name: category.name, slug: category.slug } : undefined}
        pathSlugs={categories.map((c) => c.slug)}
      />

      {category && siblings.length ? (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dans la même catégorie</h2>
            <Link
              href={`/categories/${category.slug}`}
              className="shrink-0 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-green-800 shadow-sm ring-1 ring-black/5 transition hover:bg-white"
            >
              Tout voir →
            </Link>
          </div>
          <ul className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
