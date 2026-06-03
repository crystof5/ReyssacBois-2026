import { CardLink } from "@/components/ui/Card"
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
    <CardLink href={href} className="h-full self-stretch">
      <div className="flex h-full flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-surface-2">
          {category.imageUrl ? (
            <>
              {/* Photo d'ambiance en plein cadre + léger zoom au survol */}
              <Media
                src={category.imageUrl}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              />
              {/* Dégradé bas pour la profondeur / lisibilité */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-12 w-12 text-line-strong">
                <rect x="3" y="5" width="18" height="3.4" />
                <rect x="3" y="10.3" width="18" height="3.4" />
                <rect x="3" y="15.6" width="13" height="3.4" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3
              className="rb-clamp-2 min-h-[2.6rem] text-base sm:text-lg font-bold text-ink group-hover:text-forest-700"
              title={category.name}
            >
              {category.name}
            </h3>

            {childrenCount > 0 && (
              <span className="rb-badge rb-badge-green shrink-0">
                {childrenCount} sous-cat.
              </span>
            )}
          </div>

          {showDescription ? (
            <p
              className="rb-clamp-3 mt-2 min-h-[3.75rem] whitespace-pre-line text-sm leading-relaxed text-ink-600"
              title={category.description ?? ""}
            >
              {category.description ?? ""}
            </p>
          ) : null}

          <div className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
            <span>Découvrir</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
              →
            </span>
          </div>
        </div>
      </div>
    </CardLink>
  )
}
