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
    <CardLink href={href} className="h-full self-stretch">
      <div className="flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-surface-2 p-4 sm:p-5">
          <Media
            src={product.imageUrl}
            alt={product.name}
            // Packshots: on évite le crop -> on “recule” l’image.
            className="h-full w-full !object-contain"
          />
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3
            className="rb-clamp-2 min-h-[2.6rem] text-base sm:text-lg font-bold text-ink group-hover:text-forest-700"
            title={product.name}
          >
            {product.name}
          </h3>

          <p
            className="rb-clamp-3 mt-2 min-h-[3.75rem] whitespace-pre-line text-sm leading-relaxed text-ink-600"
            title={product.description ?? ""}
          >
            {product.description ?? ""}
          </p>

          <div className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
            <span>Voir la fiche</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
              →
            </span>
          </div>
        </div>

        {/* Spec strip — étiquette de stock (section • largeur) */}
        {meta ? (
          <p
            className="rb-clamp-1 border-t border-line bg-surface-2 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-600 sm:px-6"
            title={meta}
          >
            {meta}
          </p>
        ) : null}
      </div>
    </CardLink>
  )
}
