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
      className={`rounded-2xl border border-gray-200/70 bg-white shadow-sm ring-1 ring-black/5 transition-colors ${className}`}
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
      className={`group block rounded-2xl border border-gray-200/70 bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg hover:ring-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/30 active:translate-y-0 ${className}`}
    >
      {children}
    </Link>
  )
}


