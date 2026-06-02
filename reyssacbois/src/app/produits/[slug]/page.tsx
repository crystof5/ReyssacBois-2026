import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getProductBreadcrumb } from "@/lib/breadcrumbs"
import Media from "@/components/ui/Media"
import { ButtonLink } from "@/components/ui/Button"
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
  const categoryHint = categories.at(-1)?.name
  const hasSpecs = Boolean(
    product.section || product.length || product.width || product.type,
  )

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
        <div className="rb-surface overflow-hidden p-0 lg:sticky lg:top-24">
          <div className="aspect-[4/3] w-full bg-surface-2 p-5 sm:p-6">
            <Media
              src={product.imageUrl}
              alt={product.name}
              // Packshots: affiche l’image entière (sans crop).
              className="h-full w-full !object-contain"
            />
          </div>
        </div>

        <div>
          <p className="rb-kicker">{categoryHint ?? "Produit"}</p>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            {product.name}
          </h1>

          {(product.descriptionHtml || product.description) && (
            <div className="rb-surface mt-5 p-5 sm:p-6">
              <h2 className="rb-eyebrow">Description</h2>
              {product.descriptionHtml ? (
                <RichText html={product.descriptionHtml} className="mt-3 text-ink-600" />
              ) : (
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-600">
                  {product.description}
                </p>
              )}
            </div>
          )}

          <div className="rb-surface mt-5 p-5 sm:p-6">
            <h2 className="rb-eyebrow">Caractéristiques</h2>

            {hasSpecs ? (
              <dl className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {product.section && (
                  <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">Section</dt>
                    <dd className="text-right font-semibold text-ink">{product.section}</dd>
                  </div>
                )}
                {product.length && (
                  <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">Longueur</dt>
                    <dd className="text-right font-semibold text-ink">{product.length}</dd>
                  </div>
                )}
                {product.width && (
                  <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">Largeur</dt>
                    <dd className="text-right font-semibold text-ink">{product.width}</dd>
                  </div>
                )}
                {product.type && (
                  <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">Type</dt>
                    <dd className="text-right font-semibold text-ink">{product.type}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-ink-600">
                Caractéristiques détaillées disponibles sur demande.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact">Demander un devis</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
