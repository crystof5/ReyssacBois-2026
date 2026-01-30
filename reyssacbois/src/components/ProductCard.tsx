import { CardLink } from "@/components/ui/Card"
import Media from "@/components/ui/Media"

type ProductLike = {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  section?: string | null
  width?: string | null
}

export default function ProductCard({
  product,
  href = `/produits/${product.slug}`,
}: {
  product: ProductLike
  href?: string
}) {
  const meta = [product.section, product.width].filter(Boolean).join(" • ")

  return (
    <CardLink href={href} className="self-stretch h-full overflow-hidden bg-white/75 hover:bg-white/85">
      <div className="flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/[0.03] p-4 sm:p-5">
          <Media
            src={product.imageUrl}
            alt={product.name}
            // Packshots: on évite le crop -> on “recule” l’image.
            className="h-full w-full !object-contain"
          />
        </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3
          className="rb-clamp-2 min-h-[2.6rem] text-base sm:text-lg font-bold text-gray-900 group-hover:text-green-800"
          title={product.name}
        >
          {product.name}
        </h3>

        <p className="rb-clamp-1 mt-1 min-h-[1rem] text-xs font-medium text-gray-600" title={meta}>
          {meta}
        </p>

        <p
          className="rb-clamp-3 mt-2 min-h-[3.75rem] whitespace-pre-line text-sm leading-relaxed text-gray-700"
          title={product.description ?? ""}
        >
          {product.description ?? ""}
        </p>

        <div className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-700">
          <span>Voir la fiche</span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </div>
      </div>
      </div>
    </CardLink>
  )
}
