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

  return (
    <CardLink href={href}>
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <Media
          src={category.imageUrl}
          alt={category.name}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
        {childrenCount > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-green-900 shadow-sm">
            {childrenCount} sous-catégorie{childrenCount > 1 ? "s" : ""}
          </span>
        )}
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
