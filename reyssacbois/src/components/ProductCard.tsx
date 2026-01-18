import { CardLink } from "@/components/ui/Card"
import Media from "@/components/ui/Media"
import { truncateText } from "@/lib/text"

type ProductLike = {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  section?: string | null
  species?: string | null
}

export default function ProductCard({
  product,
  href = `/produits/${product.slug}`,
}: {
  product: ProductLike
  href?: string
}) {
  return (
    <CardLink href={href} className="overflow-hidden">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <Media src={product.imageUrl} alt={product.name} className="h-full w-full" />
      </div>

      <div className="p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-800">
          {product.name}
        </h3>

        {(product.section || product.species) && (
          <p className="mt-1 text-xs text-gray-500">
            {[product.section, product.species].filter(Boolean).join(" • ")}
          </p>
        )}

        {product.description && (
          <p className="mt-2 text-sm text-gray-600">
            {truncateText(product.description, 130)}
          </p>
        )}

        <div className="mt-4 text-sm font-medium text-green-700">
          Voir la fiche →
        </div>
      </div>
    </CardLink>
  )
}
