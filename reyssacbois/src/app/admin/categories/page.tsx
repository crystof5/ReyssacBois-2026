import Link from "next/link"
import { getAdminCategories } from "@/admin/queries/categories"
import SortableList from "@/admin/components/SortableList"

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()
  const parents = categories.filter((c) => !c.parentId)
  const children = categories.filter((c) => !!c.parentId)

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Catégories</h2>
      <p className="mt-1 text-sm text-gray-600">
        L’ordre des <span className="font-medium">catégories parent</span> correspond à la sidebar.
      </p>

      <div className="mt-6 space-y-6">
        <SortableList
          title="Catégories parent (ordre sidebar)"
          description="Glisse-dépose pour réordonner. Cet ordre est celui du menu catégories côté public."
          items={parents.map((c) => ({
            id: c.id,
            title: c.name,
            subtitle: `/${c.slug}`,
            rightNote: `${c._count.children} sous-cat. • ${c._count.products} produits`,
            isVisible: c.isVisible,
            editHref: `/admin/categories/${c.id}`,
            viewHref: `/categories/${c.slug}`,
          }))}
          saveKind="topCategories"
        />

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900">
            Sous-catégories (enfants)
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            L’ordre des sous-catégories se règle dans la page du parent (glisser-déposer).
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-3 pr-4 font-medium">Parent</th>
                  <th className="py-3 pr-4 font-medium">Ordre</th>
                  <th className="py-3 pr-4 font-medium">Visible</th>
                  <th className="py-3 pr-4 font-medium">Nom</th>
                  <th className="py-3 pr-4 font-medium">Slug</th>
                  <th className="py-3 pr-4 font-medium">Admin</th>
                  <th className="py-3 pr-4 font-medium">Lien</th>
                </tr>
              </thead>
              <tbody>
                {children.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-gray-700">{c.parent?.name ?? "—"}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-700">{c.sortOrder}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.isVisible ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {c.isVisible ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{c.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-700">{c.slug}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/categories/${c.id}`} className="text-gray-900 hover:underline">
                        Éditer
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Link href={`/categories/${c.slug}`} className="text-green-700 hover:underline">
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


