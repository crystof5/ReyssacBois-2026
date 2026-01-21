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
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50 p-4 sm:p-5">
        <Media
          src={product.imageUrl}
          alt={product.name}
          // Packshots: on évite le crop -> on “recule” l’image.
          className="h-full w-full !object-contain"
        />
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-800">
          {product.name}
        </h3>

        {(product.section || product.species) && (
          <p className="mt-1 text-xs text-gray-500">
            {[product.section, product.species].filter(Boolean).join(" • ")}
          </p>
        )}

        {product.description && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {truncateText(product.description, 130)}
          </p>
        )}

        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-700">
          <span>Voir la fiche</span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </div>
      </div>
    </CardLink>
  )
}
