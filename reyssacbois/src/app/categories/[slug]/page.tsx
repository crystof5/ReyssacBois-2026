import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getCategoryBreadcrumb } from "@/lib/breadcrumbs"
import CategoryCard from "@/components/CategoryCard"
import ProductCard from "@/components/ProductCard"
import { ButtonLink } from "@/components/ui/Button"
import type { Metadata } from "next"
import { buildDescription } from "@/lib/meta"
import { getCategoriesTree } from "@/lib/categories"
import { unstable_cache } from "next/cache"
import RichText from "@/components/ui/RichText"
import Media from "@/components/ui/Media"

type CategoryNode = {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  children?: CategoryNode[]
}

function findCategoryInTree(nodes: CategoryNode[], id: string): CategoryNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const child = n.children?.length ? findCategoryInTree(n.children, id) : null
    if (child) return child
  }
  return null
}

const getProductsForCategoryCached = unstable_cache(
  async (categoryId: string) => {
    return await prisma.product.findMany({
      where: {
        isVisible: true,
        categories: { some: { categoryId } },
      },
      // `ProductCard` consomme un sous-ensemble: on évite de surcharger le payload.
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        section: true,
        width: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })
  },
  ["categoryProducts"],
  {
    // Tag volontairement commun pour bénéficier des invalidations déjà en place (admin produits/catégories).
    // - `updateProduitAction` revalidateTag("sitemap")
    // - `updateCategoryAction` revalidateTag("sitemap")
    revalidate: 60 * 30,
    tags: ["sitemap"],
  },
)

async function getProductsForCategory(categoryId: string) {
  // En dev: reflète immédiatement (Neon SQL editor, etc.).
  if (process.env.NODE_ENV !== "production") {
    return await prisma.product.findMany({
      where: {
        isVisible: true,
        categories: { some: { categoryId } },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        section: true,
        width: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })
  }
  return await getProductsForCategoryCached(categoryId)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!slug) {
    return { robots: { index: false, follow: false } }
  }

  const breadcrumb = await getCategoryBreadcrumb(slug)
  if (!breadcrumb || breadcrumb.length === 0) {
    return { robots: { index: false, follow: false } }
  }

  const category = breadcrumb[breadcrumb.length - 1]

  const description = buildDescription(
    category.description,
    `Découvrez nos produits dans la catégorie ${category.name}. Devis et conseils à Reyssac Bois.`,
  )

  return {
    title: category.name,
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title: category.name,
      description,
      url: `/categories/${slug}`,
      type: "website",
      images: category.imageUrl ? [{ url: category.imageUrl, alt: category.name }] : undefined,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug?: string }>
}) {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

  const breadcrumb = (await getCategoryBreadcrumb(slug)) ?? []
  if (breadcrumb.length === 0) notFound()
  const category = breadcrumb[breadcrumb.length - 1]

  // IMPORTANT (SEO + perf):
  // - Sous-catégories: on les prend depuis `categoriesTree` (cache serveur) -> 0 requête DB ici
  // - Produits: 1 requête DB, mais cachée + invalidée via tags admin
  const [categoriesTreeRaw, products] = await Promise.all([
    getCategoriesTree(),
    getProductsForCategory(category.id),
  ])

  const categoriesTree = categoriesTreeRaw as unknown as CategoryNode[]
  const currentNode = findCategoryInTree(categoriesTree, category.id)
  const children = currentNode?.children ?? []

  return (
    <div>
      {/* ✅ BREADCRUMB ICI */}
      <div className="hidden md:block">
        <Breadcrumb
          items={[
            { id: "catalogue", name: "Catalogue", href: "/produits" },
            ...breadcrumb.map((c) => ({
              id: c.id,
              name: c.name,
              href: `/categories/${c.slug}`,
            })),
          ]}
        />
      </div>

      <div className="rb-surface rb-grid-bg p-6 sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            {category.imageUrl ? (
              <div className="w-full sm:w-56">
                <div className="overflow-hidden rounded border border-line bg-surface-2">
                  <div className="aspect-[4/3] w-full p-4">
                    <Media
                      src={category.imageUrl}
                      alt={category.name}
                      // Packshot: on affiche l’image entière (sans crop).
                      className="h-full w-full !object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <p className="rb-kicker">Catégorie</p>
              <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                {category.name}
              </h1>

              {category.descriptionHtml ? (
                <div className="mt-3 max-w-3xl" title={category.description ?? ""}>
                  <RichText html={category.descriptionHtml} className="text-ink-600" />
                </div>
              ) : category.description ? (
                <p className="mt-3 max-w-3xl whitespace-pre-line text-ink-600" title={category.description}>
                  {category.description}
                </p>
              ) : null}
            </div>
          </div>

          <ButtonLink href="/#contact">Nous contacter</ButtonLink>
        </div>
      </div>

      {/* SOUS-CATÉGORIES CLIQUABLES */}
      {children.length > 0 && (
        <section className="mt-10">
          <h2 className="rb-kicker">Sous-catégories</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {children.map((child) => (
              <li key={child.id}>
                <CategoryCard category={child} showDescription />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PRODUITS CLIQUABLES */}
      {products.length > 0 && (
        <section className="mt-10">
          <h2 className="rb-kicker">Produits</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ÉTAT VIDE */}
      {children.length === 0 && products.length === 0 && (
        <div className="rb-surface mt-10 p-8 text-center">
          <p className="text-ink-600">
            Cette catégorie ne contient pas encore d’éléments à afficher.
          </p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href="/#contact" variant="secondary">
              Nous contacter
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  )
}
