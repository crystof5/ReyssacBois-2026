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
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/[0.03] p-4 sm:p-5">
          <Media
            src={category.imageUrl}
            alt={category.name}
            // Packshots: on évite le crop -> on “recule” l’image.
            className="h-full w-full !object-contain"
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
              className="rb-clamp-3 mt-2 min-h-[3.75rem] whitespace-pre-line text-sm leading-relaxed text-gray-700"
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
