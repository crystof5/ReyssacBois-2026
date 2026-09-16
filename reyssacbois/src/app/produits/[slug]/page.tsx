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
import ProductCard from "@/components/ProductCard"
import { BUSINESS } from "@/lib/business"
import { getArticleForCategory } from "@/lib/articles"
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

const REASSURANCE = [
  "Conseil au comptoir ou par téléphone",
  "Retrait au dépôt de Boé, près d'Agen",
  "Livraison Lot-et-Garonne, Gers, Tarn-et-Garonne",
]

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
  // Guide conseil : celui de la catégorie, sinon celui d'un parent.
  const guide = [...categories].reverse().map((c) => getArticleForCategory(c.slug)).find(Boolean) ?? null

  const services = [
    categories.some((c) => c.slug === "panneaux")
      ? {
          href: "/decoupe-panneaux-sur-mesure",
          title: "Découpe sur mesure",
          text: "Panneaux découpés à vos cotes dans notre atelier.",
          icon: "M6 3v6m0 6v6M6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 0 14-6M6 15l14 6",
        }
      : {
          href: "/contact",
          title: "Contact et accès",
          text: "Dépôt de Boé, près d'Agen, du lundi au vendredi.",
          icon: "M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
        },
    {
      href: "/livraison-bois",
      title: "Livraison",
      text: "Agglomération d'Agen, Lot-et-Garonne, Gers, Tarn-et-Garonne.",
      icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    },
    guide
      ? {
          href: `/conseils/${guide.slug}`,
          title: "Guide conseil",
          text: guide.title,
          icon: "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h12M9 7h6M9 11h6",
        }
      : {
          href: "/conseils",
          title: "Nos conseils",
          text: "Choisir ses bois, panneaux et traitements.",
          icon: "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h12M9 7h6M9 11h6",
        },
  ]

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

      <article className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Visuel */}
        <div className="lg:sticky lg:top-24">
          <div className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-[#f5f2ec] shadow-sm">
            {product.imageUrl ? (
              // Fond : la même image, floutée, pour habiller le cadre quel que soit le format.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-2xl"
              />
            ) : null}
            <div className="relative aspect-[4/3] w-full p-5 sm:aspect-square sm:p-10">
              <Media
                src={product.imageUrl}
                alt={product.name}
                // Packshot : image entière, sans recadrage.
                className="h-full w-full !object-contain drop-shadow-[0_18px_30px_rgba(40,30,15,0.35)] transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            {product.imageUrl ? (
              <a
                href={product.imageUrl}
                target="_blank"
                rel="noopener"
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
                  <path d="M3 3h5v2H6.41l3.3 3.29-1.42 1.42L5 6.41V8H3V3Zm14 14h-5v-2h1.59l-3.3-3.29 1.42-1.42L15 13.59V12h2v5Z" />
                </svg>
                Agrandir
              </a>
            ) : null}
          </div>
          {category ? (
            <Link
              href={`/categories/${category.slug}`}
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white/85 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-black/5 backdrop-blur hover:text-green-800"
            >
              ← Tous les produits « {category.name} »
            </Link>
          ) : null}
        </div>

        {/* Informations */}
        <div className="rounded-2xl border border-black/[0.06] bg-white/90 p-5 shadow-sm backdrop-blur sm:p-7">
          {category ? (
            <Link
              href={`/categories/${category.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-green-800 hover:underline underline-offset-4"
            >
              {category.name}
            </Link>
          ) : null}
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold leading-tight text-gray-900">{product.name}</h1>

          {product.descriptionHtml ? (
            <RichText html={product.descriptionHtml} className="mt-4 text-base text-gray-700" />
          ) : product.description ? (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-gray-700">{product.description}</p>
          ) : null}

          {specs.length ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">Caractéristiques</h2>
              <dl className="mt-2 divide-y divide-stone-200 rounded-xl border border-stone-200">
                {specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-2.5 text-sm">
                    <dt className="text-gray-500">{spec.label}</dt>
                    <dd className="font-medium text-gray-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              Demander un devis
            </Link>
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-green-700 hover:text-green-800"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.513 2.31a1.5 1.5 0 0 1-1.02 1.745l-.97.323a11.037 11.037 0 0 0 6.31 6.31l.323-.97a1.5 1.5 0 0 1 1.745-1.02l2.31.513A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15C8.096 18 2 11.904 2 5V3.5Z" />
              </svg>
              {BUSINESS.phoneDisplay}
            </a>
          </div>

          <ul className="mt-5 space-y-2 border-t border-stone-200 pt-5 text-sm text-gray-700">
            {REASSURANCE.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-green-700">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </article>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {services.map((service) => (
          <li key={service.href}>
            <Link
              href={service.href}
              className="group flex h-full items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/90 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-green-800/25 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-800 transition group-hover:bg-green-700 group-hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
                  <path d={service.icon} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-gray-900 group-hover:text-green-800">{service.title}</span>
                <span className="mt-0.5 block text-sm leading-snug text-gray-600">{service.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

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
