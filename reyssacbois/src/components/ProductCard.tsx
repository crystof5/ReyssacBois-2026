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
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Media
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.04]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent opacity-70 transition-opacity duration-200 group-hover:opacity-90"
          aria-hidden
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
