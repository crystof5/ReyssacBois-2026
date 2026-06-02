import { getCategoriesTree } from "@/lib/categories"
import Breadcrumb from "@/components/Breadcrumb"
import CategoryCard from "@/components/CategoryCard"
import { ButtonLink } from "@/components/ui/Button"
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

      <div className="rb-surface p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="rb-kicker">Catalogue</p>
            <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Catalogue
            </h1>
            <p className="mt-2 text-ink-600">
              Sélectionnez une catégorie pour découvrir nos produits bois.
            </p>
          </div>

          <ButtonLink href="/#contact">Demander un devis</ButtonLink>
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
