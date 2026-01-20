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

async function isCategoryEffectivelyVisible(categoryId: string) {
  let currentId: string | null = categoryId
  // garde-fou anti-boucle
  const visited = new Set<string>()
  while (currentId) {
    if (visited.has(currentId)) return false
    visited.add(currentId)

    const cat: { id: string; parentId: string | null; isVisible: boolean } | null =
      await prisma.category.findUnique({
      where: { id: currentId },
      select: { id: true, parentId: true, isVisible: true },
    })
    if (!cat) return false
    if (!cat.isVisible) return false
    currentId = cat.parentId
  }
  return true
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

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
    },
  })

  if (!category) {
    return { robots: { index: false, follow: false } }
  }

  if (!(await isCategoryEffectivelyVisible(category.id))) {
    return { robots: { index: false, follow: false } }
  }

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

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: true,
    },
  })

  if (!category) {
    notFound()
  }

  // Si la catégorie (ou un parent) est caché => 404 côté public
  if (!(await isCategoryEffectivelyVisible(category.id))) {
    notFound()
  }

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
