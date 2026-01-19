import Link from "next/link"
import { getAdminCategories } from "@/admin/queries/categories"

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Catégories</h2>
      <p className="mt-1 text-sm text-gray-600">
        Liste en lecture seule (édition à venir).
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-3 pr-4 font-medium">Nom</th>
              <th className="py-3 pr-4 font-medium">Slug</th>
              <th className="py-3 pr-4 font-medium">Parent</th>
              <th className="py-3 pr-4 font-medium">Sous-cat.</th>
              <th className="py-3 pr-4 font-medium">Produits</th>
              <th className="py-3 pr-4 font-medium">Admin</th>
              <th className="py-3 pr-4 font-medium">Lien</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">
                  {c.name}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-gray-700">
                  {c.slug}
                </td>
                <td className="py-3 pr-4 text-gray-700">
                  {c.parent?.name ?? "—"}
                </td>
                <td className="py-3 pr-4 text-gray-700">{c._count.children}</td>
                <td className="py-3 pr-4 text-gray-700">{c._count.products}</td>
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/categories/${c.id}`}
                    className="text-gray-900 hover:underline"
                  >
                    Éditer
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <Link
                    href={`/categories/${c.slug}`}
                    className="text-green-700 hover:underline"
                  >
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


