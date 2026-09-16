import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getCategoryBreadcrumb } from "@/lib/breadcrumbs"
import CategoryCard from "@/components/CategoryCard"
import ProductCard from "@/components/ProductCard"
import Link from "next/link"
import type { Metadata } from "next"
import { getCategorySeo } from "@/lib/categorySeo"
import { getCategoriesTree } from "@/lib/categories"
import { unstable_cache } from "next/cache"
import RichText from "@/components/ui/RichText"
import Media from "@/components/ui/Media"
import ItemDetail from "@/components/catalog/ItemDetail"

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
  const { title, description } = getCategorySeo(slug, breadcrumb)

  return {
    title,
    description,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: {
      title,
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
  const isLeafWithoutProducts = children.length === 0 && products.length === 0
  const parent = breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : null

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

      {isLeafWithoutProducts ? (
        // Catégorie "fiche" (contenu dans la description) : présentée comme un produit.
        <ItemDetail
          title={category.name}
          imageUrl={category.imageUrl}
          description={category.description}
          descriptionHtml={category.descriptionHtml}
          parent={parent ? { name: parent.name, slug: parent.slug } : undefined}
          backLabel={parent ? `← Retour à « ${parent.name} »` : undefined}
          pathSlugs={breadcrumb.map((c) => c.slug)}
        />
      ) : (
        <div className="rb-depth-shadow rounded-2xl border border-white/15 bg-white/55 p-6 sm:p-7 backdrop-blur ring-1 ring-black/5">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
              {category.imageUrl ? (
                <div className="group/photo w-full sm:w-56 [perspective:800px]">
                  <div className="overflow-hidden rounded-xl shadow-[0_2px_4px_rgba(60,40,15,0.12),0_14px_28px_-12px_rgba(60,40,15,0.45)] ring-1 ring-black/10 transition duration-500 ease-out group-hover/photo:[transform:rotateY(-6deg)_rotateX(3deg)_scale(1.05)] group-hover/photo:shadow-[0_6px_10px_rgba(60,40,15,0.15),0_30px_50px_-18px_rgba(60,40,15,0.55)] group-active/photo:scale-[0.98]">
                    <div className="aspect-[16/9] w-full sm:aspect-[4/3]">
                      <Media src={category.imageUrl} alt={category.name} className="rb-kenburns h-full w-full object-cover" />
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-xs font-semibold tracking-wide text-green-800/90">CATÉGORIE</p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                  {category.name}
                </h1>

                {category.descriptionHtml ? (
                  <div className="mt-2 max-w-3xl">
                    <RichText html={category.descriptionHtml} className="text-gray-700" />
                  </div>
                ) : category.description ? (
                  <p className="mt-2 text-gray-700 max-w-3xl whitespace-pre-line">
                    {category.description}
                  </p>
                ) : null}
              </div>
            </div>

            <Link
              href="/contact"
              className="rb-press inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      )}

      {/* SOUS-CATÉGORIES CLIQUABLES */}
      {children.length > 0 && (
        <div className="mt-10">
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {children.map((child) => (
              <li key={child.id}>
                <CategoryCard category={child} showDescription />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PRODUITS CLIQUABLES */}
      {products.length > 0 && (
        <div className="mt-10">
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
