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
    <CardLink href={href} className="self-stretch h-full overflow-hidden bg-white/75 hover:bg-white/85">
      <div className="flex h-full flex-col">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50/80 p-4 sm:p-5">
        <Media
          src={category.imageUrl}
          alt={category.name}
          // Packshots: on évite le crop -> on “recule” l’image.
          className="h-full w-full !object-contain"
        />
        {/* Reflet / texture légère pour donner du relief */}
        <div
          className="pointer-events-none absolute inset-0
          bg-[radial-gradient(800px_circle_at_20%_0%,rgba(255,255,255,0.75),transparent_55%)]
          opacity-60"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0
          bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_40%,rgba(0,0,0,0.04))]
          opacity-100"
          aria-hidden
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="rb-clamp-2 min-h-[2.6rem] text-base sm:text-lg font-bold text-gray-900 group-hover:text-green-800"
            title={category.name}
          >
            {category.name}
          </h3>

          {childrenCount > 0 && (
            <span className="shrink-0 rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-800">
              {childrenCount} sous-cat.
            </span>
          )}
        </div>

        {showDescription ? (
          <p
            className="rb-clamp-3 mt-2 min-h-[3.75rem] text-sm leading-relaxed text-gray-700"
            title={category.description ?? ""}
          >
            {category.description ?? ""}
          </p>
        ) : null}

        <div className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-700">
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
