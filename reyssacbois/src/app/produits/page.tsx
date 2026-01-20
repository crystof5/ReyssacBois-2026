import Link from "next/link"
import { getCategoriesTree } from "@/lib/categories"
import Breadcrumb from "@/components/Breadcrumb"
import CategoryCard from "@/components/CategoryCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Produits",
  description: "Découvrez nos produits bois : sélectionnez une catégorie pour explorer le catalogue Reyssac Bois.",
  alternates: { canonical: "/produits" },
}

export default async function ProduitsPage() {
  const categories = await getCategoriesTree()

  return (
    <div>
      <Breadcrumb
        items={[{ id: "produits", name: "Produits", href: "/produits" }]}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Produits
          </h1>
          <p className="mt-2 text-gray-600">
            Sélectionnez une catégorie pour découvrir nos produits bois.
          </p>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
        >
          Demander un devis
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
