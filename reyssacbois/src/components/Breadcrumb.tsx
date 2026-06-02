import Link from "next/link"

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
      <ol className="inline-flex max-w-full flex-wrap items-center gap-2 border-b border-line pb-2 text-xs text-ink-600">
        <li className="min-w-0">
          <Link href="/" className="font-medium text-ink underline-offset-4 hover:text-forest-700 hover:underline">
            Accueil
          </Link>
        </li>

        {items.map((item) => (
          <li key={item.id} className="flex min-w-0 items-center gap-2">
            <span className="text-line-strong" aria-hidden>
              /
            </span>
            <Link
              href={item.href}
              className="rb-clamp-1 max-w-[40ch] font-medium text-ink-600 underline-offset-4 hover:text-forest-700 hover:underline"
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
