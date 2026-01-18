import Link from "next/link"

export default function Breadcrumb({
  items,
}: {
  items: { id: string; name: string; slug: string }[]
}) {
  return (
    <nav className="text-sm text-gray-500 mb-6">
      <Link href="/" className="hover:underline">
        Accueil
      </Link>

      {items.map((item) => (
        <span key={item.id}>
          {" > "}
          <Link
            href={`/categories/${item.slug}`}
            className="hover:underline"
          >
            {item.name}
          </Link>
        </span>
      ))}
    </nav>
  )
}
