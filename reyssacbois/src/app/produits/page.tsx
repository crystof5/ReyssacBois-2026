import Link from "next/link"
import { getCategoriesTree } from "@/lib/categories"

export default async function ProduitsPage() {
  const categories = await getCategoriesTree()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Produits
      </h1>

      <p className="text-gray-600 mb-8">
        Sélectionnez une catégorie pour découvrir nos produits bois.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="block border rounded-lg p-6 hover:shadow hover:border-green-600 transition"
          >
            <h2 className="text-lg font-semibold mb-2">
              {category.name}
            </h2>

            {category.description && (
              <p className="text-sm text-gray-600">
                {category.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
