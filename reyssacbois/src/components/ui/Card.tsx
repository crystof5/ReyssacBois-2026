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
      className={`relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/55 shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors
      before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(900px_circle_at_20%_0%,rgba(255,255,255,0.85),transparent_50%)] before:opacity-70
      after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(255,255,255,0.20),transparent_40%,rgba(0,0,0,0.03))] after:opacity-100
      ${className}`}
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
      className={`group relative block overflow-hidden rounded-2xl border border-gray-200/70 bg-white/55 shadow-sm ring-1 ring-black/5 backdrop-blur transition-all duration-200
      hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_18px_45px_-28px_rgba(0,0,0,0.55)] hover:ring-black/10
      hover:bg-white/65
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/30 active:translate-y-0
      before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(900px_circle_at_15%_0%,rgba(255,255,255,0.90),transparent_55%)] before:opacity-60 before:transition-opacity before:duration-200 group-hover:before:opacity-85
      after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_45%,rgba(0,0,0,0.04))] after:opacity-100
      ${className}`}
    >
      {children}
    </Link>
  )
}


