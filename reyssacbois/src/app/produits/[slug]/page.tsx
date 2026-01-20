import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getProductBreadcrumb } from "@/lib/breadcrumbs"
import Media from "@/components/ui/Media"
import Link from "next/link"
import type { Metadata } from "next"
import { buildDescription } from "@/lib/meta"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const runtime = "nodejs"
export const preferredRegion = ["fra1"]

function normalizeSeoKeyPart(v: string | null | undefined) {
  return (v ?? "").trim().toLowerCase().replace(/\s+/g, " ")
}

function productSeoKey(p: {
  name: string
  section?: string | null
  length?: string | null
  species?: string | null
  type?: string | null
  standard?: string | null
}) {
  // Clé “dédup” : si deux produits ont la même clé, on les considère identiques côté SEO.
  // (Assez stricte pour éviter de fusionner des produits réellement différents.)
  return [
    normalizeSeoKeyPart(p.name),
    normalizeSeoKeyPart(p.section),
    normalizeSeoKeyPart(p.length),
    normalizeSeoKeyPart(p.species),
    normalizeSeoKeyPart(p.type),
    normalizeSeoKeyPart(p.standard),
  ].join("|")
}

const getCanonicalProductSlugCached = unstable_cache(
  async (current: {
  slug: string
  name: string
  section?: string | null
  length?: string | null
  species?: string | null
  type?: string | null
  standard?: string | null
}) => {
  // Cherche les “doublons” stricts (même nom + mêmes champs techniques)
  // puis choisit une URL canonique stable.
  const candidates = await prisma.product.findMany({
    where: {
      isVisible: true,
      name: { equals: current.name, mode: "insensitive" },
      section: { equals: current.section ?? null },
      length: { equals: current.length ?? null },
      species: { equals: current.species ?? null },
      type: { equals: current.type ?? null },
      standard: { equals: current.standard ?? null },
    },
    select: {
      slug: true,
      sortOrder: true,
      createdAt: true,
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

  // Très important : le canonique doit être une page réellement “publique” (catégories visibles)
  // On s'appuie sur getProductBreadcrumb qui retourne null si le produit n'est pas publiable.
  for (const c of sorted) {
    const ok = await getProductBreadcrumb(c.slug)
    if (ok) return c.slug
  }

  return current.slug
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
    species: product.species,
    type: product.type,
    standard: product.standard,
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
      <Breadcrumb
        items={[
          { id: "produits", name: "Produits", href: "/produits" },
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

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="aspect-[4/3] w-full">
            <Media src={product.imageUrl} alt={product.name} className="h-full w-full" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-3 text-gray-600">
              {product.description}
            </p>
          )}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
              {product.species && (
                <div>
                  <dt className="text-gray-500">Essence</dt>
                  <dd className="font-medium text-gray-900">{product.species}</dd>
                </div>
              )}
              {product.type && (
                <div>
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium text-gray-900">{product.type}</dd>
                </div>
              )}
              {product.standard && (
                <div>
                  <dt className="text-gray-500">Norme</dt>
                  <dd className="font-medium text-gray-900">{product.standard}</dd>
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

              {categories[0]?.slug && (
                <Link
                  href={`/categories/${categories[0].slug}`}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                >
                  Voir la catégorie
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
