import Link from "next/link"
import { BreadcrumbJsonLd } from "@/components/JsonLd"

type BreadcrumbItem = {
  id: string
  name: string
  href: string
}

export default function Breadcrumb({
  items,
}: {
  items: BreadcrumbItem[]
}) {
  return (
    <nav
      aria-label="Fil d’Ariane"
      className="mb-6"
    >
      <BreadcrumbJsonLd items={[{ name: "Accueil", href: "/" }, ...items]} />
      <ol className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-white/20 bg-white/65 px-3 py-2 text-xs text-gray-700 shadow-sm ring-1 ring-black/5 backdrop-blur">
        <li className="min-w-0">
          <Link href="/" className="font-medium text-gray-900 hover:underline underline-offset-4">
            Accueil
          </Link>
        </li>

        {items.map((item) => (
          <li key={item.id} className="flex min-w-0 items-center gap-1">
            <span className="text-gray-400" aria-hidden>
              /
            </span>
            <Link
              href={item.href}
              className="rb-clamp-1 max-w-[40ch] font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4"
              title={item.name}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
