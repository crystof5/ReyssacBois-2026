import { getAdminProduits } from "@/admin/queries/produits"
import SortableList from "@/admin/components/SortableList"

export default async function AdminProduitsPage() {
  const produits = await getAdminProduits()

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Produits</h2>
      <p className="mt-1 text-sm text-gray-600">
        Glisse-dépose pour définir l’ordre d’affichage (listes publiques).
      </p>

      <div className="mt-6">
        <SortableList
          title={`Produits (${produits.length})`}
          description="Cet ordre est utilisé dans les listes produits (tri par ordre puis nom)."
          items={produits.map((p) => ({
            id: p.id,
            title: p.name,
            subtitle: `/${p.slug}`,
            rightNote: `${p._count.categories} catégories`,
            isVisible: p.isVisible,
            editHref: `/admin/produits/${p.id}`,
            viewHref: `/produits/${p.slug}`,
          }))}
          saveKind="products"
        />
      </div>
    </div>
  )
}


