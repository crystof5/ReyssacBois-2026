import Link from "next/link"
import { getCategoriesTree } from "@/lib/categories"
import Breadcrumb from "@/components/Breadcrumb"
import CategoryCard from "@/components/CategoryCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Catalogue Reyssac Bois : sélectionnez une catégorie pour explorer nos produits bois.",
  alternates: { canonical: "/produits" },
}

export default async function ProduitsPage() {
  const categories = await getCategoriesTree()

  return (
    <div>
      <div className="hidden md:block">
        <Breadcrumb
          items={[{ id: "catalogue", name: "Catalogue", href: "/produits" }]}
        />
      </div>

      <div className="rounded-3xl border border-white/15 bg-white/55 p-6 sm:p-7 backdrop-blur shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-green-800/90">CATALOGUE</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Catalogue
            </h1>
            <p className="mt-2 text-gray-700">
              Sélectionnez une catégorie pour découvrir nos produits bois.
            </p>
          </div>

          <Link
            href="/#contact"
            className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          >
            Demander un devis
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
