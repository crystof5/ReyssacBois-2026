import Breadcrumb from "@/components/Breadcrumb"
import CategoryCard from "@/components/CategoryCard"
import type { Metadata } from "next"
import { getCategoriesTree } from "@/lib/categories"

export const metadata: Metadata = {
  title: "Catégories",
  description: "Parcourez nos familles de produits bois chez Reyssac Bois.",
  alternates: { canonical: "/categories" },
}

export default async function CategoriesIndexPage() {
  // IMPORTANT (SEO + perf): réutilise le cache serveur `categoriesTree`
  // au lieu de taper la DB à chaque crawl/visite.
  const categories = await getCategoriesTree()

  return (
    <div>
      <div className="hidden md:block">
        <Breadcrumb items={[{ id: "categories", name: "Catégories", href: "/categories" }]} />
      </div>

      <div className="rounded-3xl border border-white/15 bg-white/55 p-6 sm:p-7 backdrop-blur shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold tracking-wide text-green-800/90">CATALOGUE</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          Catégories
        </h1>
        <p className="mt-2 text-gray-700">
          Parcourez les familles du catalogue.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
          </li>
        ))}
      </ul>
    </div>
  )
}
