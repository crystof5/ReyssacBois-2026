import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getProductBreadcrumb } from "@/lib/breadcrumbs"
import Media from "@/components/ui/Media"
import Link from "next/link"
import type { Metadata } from "next"
import { buildDescription } from "@/lib/meta"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { getCategoriesTree } from "@/lib/categories"
import RichText from "@/components/ui/RichText"

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

  const description = buildDescription(
    product.description,
    categoryHint
      ? `${product.name} — ${categoryHint}. Caractéristiques, conseils et devis chez Reyssac Bois.`
      : `${product.name} — Caractéristiques, conseils et devis chez Reyssac Bois.`,
  )

  const isCanonical = canonicalSlug === product.slug
  const canonicalPath = `/produits/${canonicalSlug}`

  return {
    title: product.name,
    description,
    alternates: { canonical: canonicalPath },
    robots: isCanonical ? undefined : { index: false, follow: true },
    openGraph: {
      title: product.name,
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

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
          <div className="aspect-[4/3] w-full bg-gray-50 p-5 sm:p-6">
            <Media
              src={product.imageUrl}
              alt={product.name}
              // Packshots: affiche l’image entière (sans crop).
              className="h-full w-full !object-contain"
            />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {(product.descriptionHtml || product.description) && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur">
              <h2 className="text-base font-semibold text-gray-900">
                Description
              </h2>
              {product.descriptionHtml ? (
                <RichText html={product.descriptionHtml} className="mt-3 text-gray-700" />
              ) : (
                <p className="mt-3 whitespace-pre-line text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-base font-semibold text-gray-900">
              Caractéristiques
            </h2>

            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {product.section && (
                <div>
                  <dt className="text-gray-500">Section</dt>
                  <dd className="font-medium text-gray-900">{product.section}</dd>
                </div>
              )}
              {product.length && (
                <div>
                  <dt className="text-gray-500">Longueur</dt>
                  <dd className="font-medium text-gray-900">{product.length}</dd>
                </div>
              )}
              {product.width && (
                <div>
                  <dt className="text-gray-500">Largeur</dt>
                  <dd className="font-medium text-gray-900">{product.width}</dd>
                </div>
              )}
              {product.type && (
                <div>
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium text-gray-900">{product.type}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
              >
                Demander un devis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
