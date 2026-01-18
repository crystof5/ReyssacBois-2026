import Link from "next/link"

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm transition ${className}`}
    >
      {children}
    </div>
  )
}

export function CardLink({
  href,
  children,
  className = "",
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600/30 ${className}`}
    >
      {children}
    </Link>
  )
}


