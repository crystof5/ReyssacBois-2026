import Link from "next/link"
import { getCategoriesTree } from "@/lib/categories"
import Breadcrumb from "@/components/Breadcrumb"
import CategoryCard from "@/components/CategoryCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catalogue bois à Agen – Charpente, panneaux, menuiserie",
  description:
    "Catalogue Reyssac Bois à Boé près d'Agen : bois de charpente, contreplaqués et panneaux, bois de menuiserie, parquet, lambris, bardage, terrasses, quincaillerie.",
  alternates: { canonical: "/produits" },
}

type Node = { id: string; name: string; slug: string; children?: Node[] }

export default async function ProduitsPage() {
  const categories = await getCategoriesTree()

  return (
    <div>
      <div className="hidden md:block">
        <Breadcrumb
          items={[{ id: "catalogue", name: "Catalogue", href: "/produits" }]}
        />
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/55 p-6 sm:p-7 backdrop-blur shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-green-800/90">CATALOGUE</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Catalogue bois à Agen
            </h1>
            <p className="mt-2 text-gray-700 max-w-3xl">
              Bois de charpente, contreplaqués et panneaux, bois de menuiserie, parquet, lambris,
              bardage, terrasses et quincaillerie : sélectionnez une catégorie pour découvrir les
              produits disponibles dans notre dépôt de Boé, aux portes d&apos;Agen.
            </p>
          </div>

          <Link
            href="/contact"
            className="rb-press inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
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

      {/* Plan du catalogue : liens texte vers toutes les sous-catégories (découverte + maillage). */}
      <section className="mt-12 rounded-2xl border border-white/15 bg-white/55 p-6 sm:p-7 backdrop-blur shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Toutes nos catégories</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(categories as unknown as Node[]).map((category) => (
            <div key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="text-sm font-semibold text-gray-900 hover:text-green-800 hover:underline underline-offset-4"
              >
                {category.name}
              </Link>
              {category.children?.length ? (
                <ul className="mt-1.5 space-y-1 text-sm text-gray-700">
                  {category.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/categories/${child.slug}`}
                        className="hover:text-gray-900 hover:underline underline-offset-4"
                      >
                        {child.name}
                      </Link>
                      {child.children?.length ? (
                        <ul className="mt-1 ml-3 space-y-1 text-xs text-gray-600">
                          {child.children.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={`/categories/${sub.slug}`}
                                className="hover:text-gray-900 hover:underline underline-offset-4"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
