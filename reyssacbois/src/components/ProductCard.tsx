import { CardLink } from "@/components/ui/Card"
import CardArrow from "@/components/ui/CardArrow"
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
  const specs = [product.section, product.width].filter((v): v is string => Boolean(v?.trim()))

  return (
    <CardLink href={href}>
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <Media
          src={product.imageUrl}
          alt={product.name}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="rb-clamp-2 text-base sm:text-lg font-bold text-gray-900 transition-colors group-hover:text-green-800" title={product.name}>
          {product.name}
        </h3>

        {specs.length ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {specs.map((spec) => (
              <li key={spec} className="rb-clamp-1 max-w-full rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-gray-700" title={spec}>
                {spec}
              </li>
            ))}
          </ul>
        ) : null}

        {product.description ? (
          <p className="rb-clamp-2 mt-2 text-sm leading-relaxed text-gray-600" title={product.description}>
            {product.description.replace(/\s+/g, " ")}
          </p>
        ) : null}

        <CardArrow label="Voir la fiche" />
      </div>
    </CardLink>
  )
}
