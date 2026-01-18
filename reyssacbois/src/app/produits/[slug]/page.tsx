import { notFound } from "next/navigation"
import Breadcrumb from "@/components/Breadcrumb"
import { getProductBreadcrumb } from "@/lib/breadcrumbs"

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const result = await getProductBreadcrumb(params.slug)

  if (!result) {
    notFound()
  }

  const { product, categories } = result

  return (
    <div>
      <Breadcrumb
        items={[
          { id: "produits", name: "Produits", slug: "produits" },
          ...categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          })),
        ]}
      />

      <h1 className="text-2xl font-bold mb-4">
        {product.name}
      </h1>

      {product.description && (
        <p className="text-gray-600 mb-6">
          {product.description}
        </p>
      )}

      <ul className="text-sm space-y-1">
        {product.section && <li>Section : {product.section}</li>}
        {product.length && <li>Longueur : {product.length}</li>}
        {product.species && <li>Essence : {product.species}</li>}
        {product.standard && <li>Norme : {product.standard}</li>}
      </ul>
    </div>
  )
}
