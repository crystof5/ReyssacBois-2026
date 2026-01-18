import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SidebarCategories from "@/components/SidebarCategories"
import { getCategoriesTree } from "@/lib/categories"

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

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

  const categories = await getCategoriesTree()

  return (
    <div className="flex">
      <SidebarCategories
        categories={categories}
        activeSlug={slug}
      />

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">
          {category.name}
        </h1>

        {category.description && (
          <p className="text-gray-600 mb-6">
            {category.description}
          </p>
        )}

        {/* Sous-catégories */}
        {category.children.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-2">
              Sous-catégories
            </h2>
            <ul className="mb-6 list-disc list-inside">
              {category.children.map((child) => (
                <li key={child.id}>
                  {child.name}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Produits */}
        {category.products.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-2">
              Produits
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.products.map(({ product }) => (
                <li
                  key={product.id}
                  className="border rounded p-4"
                >
                  {product.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
