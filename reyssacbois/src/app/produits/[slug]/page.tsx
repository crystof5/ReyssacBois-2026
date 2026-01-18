import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getProductBreadcrumb } from "@/lib/breadcrumbs"
import Media from "@/components/ui/Media"
import Link from "next/link"

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
