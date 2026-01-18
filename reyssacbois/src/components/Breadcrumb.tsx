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
    <nav className="text-sm text-gray-500 mb-6">
      <Link href="/" className="hover:underline">
        Accueil
      </Link>

      {items.map((item) => (
        <span key={item.id}>
          {" > "}
          <Link href={item.href} className="hover:underline">
            {item.name}
          </Link>
        </span>
      ))}
    </nav>
  )
}
