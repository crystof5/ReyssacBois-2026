import { CardLink } from "@/components/ui/Card"
import Media from "@/components/ui/Media"
import { truncateText } from "@/lib/text"

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
    <CardLink href={href} className="overflow-hidden">
      <div className="aspect-[16/10] w-full overflow-hidden">
        <Media
          src={category.imageUrl}
          alt={category.name}
          className="h-full w-full"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-800">
            {category.name}
          </h3>

          {childrenCount > 0 && (
            <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">
              {childrenCount} sous-cat.
            </span>
          )}
        </div>

        {showDescription && category.description && (
          <p className="mt-2 text-sm text-gray-600">
            {truncateText(category.description, 140)}
          </p>
        )}

        <div className="mt-4 text-sm font-medium text-green-700">
          Découvrir →
        </div>
      </div>
    </CardLink>
  )
}
