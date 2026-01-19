import Link from "next/link"
import { getAdminProduits } from "@/admin/queries/produits"

export default async function AdminProduitsPage() {
  const produits = await getAdminProduits()

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Produits</h2>
      <p className="mt-1 text-sm text-gray-600">
        Liste en lecture seule (édition à venir).
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-3 pr-4 font-medium">Nom</th>
              <th className="py-3 pr-4 font-medium">Slug</th>
              <th className="py-3 pr-4 font-medium">Catégories</th>
              <th className="py-3 pr-4 font-medium">Section</th>
              <th className="py-3 pr-4 font-medium">Essence</th>
              <th className="py-3 pr-4 font-medium">Admin</th>
              <th className="py-3 pr-4 font-medium">Lien</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">
                  {p.name}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-gray-700">
                  {p.slug}
                </td>
                <td className="py-3 pr-4 text-gray-700">{p._count.categories}</td>
                <td className="py-3 pr-4 text-gray-700">{p.section ?? "—"}</td>
                <td className="py-3 pr-4 text-gray-700">{p.species ?? "—"}</td>
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/produits/${p.id}`}
                    className="text-gray-900 hover:underline"
                  >
                    Éditer
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <Link
                    href={`/produits/${p.slug}`}
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


