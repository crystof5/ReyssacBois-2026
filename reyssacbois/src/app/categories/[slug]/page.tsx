import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getCategoryBreadcrumb } from "@/lib/breadcrumbs"
import CategoryCard from "@/components/CategoryCard"
import ProductCard from "@/components/ProductCard"
import Link from "next/link"
import type { Metadata } from "next"
import { buildDescription } from "@/lib/meta"

export const runtime = "nodejs"
export const preferredRegion = ["fra1"]

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

  // Enfants / produits: filtrage + tri (ordre puis nom)
  const [children, products] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: category.id, isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: {
        isVisible: true,
        categories: {
          some: {
            categoryId: category.id,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ])

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
      {children.length > 0 && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Sous-catégories
            </h2>
          </div>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h2 className="text-lg font-semibold text-gray-900">
            Produits
          </h2>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
