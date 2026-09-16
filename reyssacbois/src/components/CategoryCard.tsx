import { CardLink } from "@/components/ui/Card"
import CardArrow from "@/components/ui/CardArrow"
import Media from "@/components/ui/Media"

type CategoryLike = {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  children?: unknown[] | null
  productCount?: number
}

export default function CategoryCard({
  category,
  href = `/categories/${category.slug}`,
  showDescription = true,
}: {
  category: CategoryLike
  href?: string
  showDescription?: boolean
}) {
  const childrenCount = Array.isArray(category.children) ? category.children.length : 0
  const productCount = category.productCount ?? 0
  const badges = [
    childrenCount > 0 ? `${childrenCount} sous-cat.` : null,
    productCount > 0 ? `${productCount} produit${productCount > 1 ? "s" : ""}` : null,
  ].filter((b): b is string => Boolean(b))

  return (
    <CardLink href={href}>
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <Media
          src={category.imageUrl}
          alt={category.name}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
        {badges.length ? (
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex flex-wrap gap-1">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white/95 backdrop-blur-sm sm:text-[11px]"
              >
                {b}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="rb-clamp-2 text-base sm:text-lg font-bold text-gray-900 transition-colors group-hover:text-green-800" title={category.name}>
          {category.name}
        </h3>

        {showDescription && category.description ? (
          <p className="rb-clamp-2 mt-1.5 text-sm leading-relaxed text-gray-600">
            {category.description.replace(/\s+/g, " ")}
          </p>
        ) : null}

        <CardArrow label={childrenCount > 0 ? "Voir la gamme" : "Voir les produits"} />
      </div>
    </CardLink>
  )
}
