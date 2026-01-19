import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getCategoryBreadcrumb } from "@/lib/breadcrumbs"
import CategoryCard from "@/components/CategoryCard"
import ProductCard from "@/components/ProductCard"
import Link from "next/link"

export const runtime = "nodejs"
export const preferredRegion = ["fra1"]

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug?: string }>
}) {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: true,
      products: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!category) {
    notFound()
  }

  const breadcrumb = (await getCategoryBreadcrumb(slug)) ?? []

  return (
    <div>
      {/* ✅ BREADCRUMB ICI */}
      <Breadcrumb
        items={[
          { id: "produits", name: "Produits", href: "/produits" },
          ...breadcrumb.map((c) => ({
            id: c.id,
            name: c.name,
            href: `/categories/${c.slug}`,
          })),
        ]}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {category.name}
          </h1>

          {category.description && (
            <p className="mt-2 text-gray-600 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
        >
          Nous contacter
        </Link>
      </div>

      {/* SOUS-CATÉGORIES CLIQUABLES */}
      {category.children.length > 0 && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Sous-catégories
            </h2>
          </div>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.children.map((child) => (
              <li key={child.id}>
                <CategoryCard category={child} showDescription />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PRODUITS CLIQUABLES */}
      {category.products.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">
            Produits
          </h2>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.products.map(({ product }) => (
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
