import Link from "next/link"
import { BreadcrumbJsonLd } from "@/components/JsonLd"

type BreadcrumbItem = {
  id: string
  name: string
  href: string
}

function Separator() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-400">
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function Breadcrumb({
  items,
}: {
  items: BreadcrumbItem[]
}) {
  const last = items.length - 1

  return (
    <nav aria-label="Fil d’Ariane" className="mb-5">
      <BreadcrumbJsonLd items={[{ name: "Accueil", href: "/" }, ...items]} />
      <ol className="rb-depth-shadow inline-flex max-w-full flex-wrap items-center gap-x-0.5 gap-y-1 rounded-lg bg-white/85 px-2 py-1.5 text-sm ring-1 ring-black/5 backdrop-blur">
        <li className="flex items-center">
          <Link
            href="/"
            className="flex origin-center items-center gap-1.5 rounded-md px-1.5 py-0.5 text-gray-600 transition duration-200 hover:scale-110 hover:bg-green-50 hover:text-green-800 active:scale-95"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
              <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v6a1 1 0 0 0 1 1h3.5v-4.5h3V18H15a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 .707-1.707l-7-7Z" />
            </svg>
            <span className="sr-only sm:not-sr-only">Accueil</span>
          </Link>
        </li>

        {items.map((item, i) => (
          <li key={item.id} className="flex min-w-0 items-center gap-1">
            <Separator />
            {i === last ? (
              <span aria-current="page" className="rb-clamp-1 max-w-[40ch] px-1.5 font-semibold text-gray-900" title={item.name}>
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="rb-clamp-1 max-w-[30ch] origin-center rounded-md px-1.5 py-0.5 text-gray-600 transition duration-200 hover:scale-110 hover:bg-green-50 hover:text-green-800 active:scale-95"
                title={item.name}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
