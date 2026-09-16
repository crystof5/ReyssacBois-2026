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
      className={`relative isolate overflow-hidden rounded-2xl border border-gray-200/70 bg-white/55 shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors
      before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(900px_circle_at_20%_0%,rgba(255,255,255,0.85),transparent_50%)] before:opacity-70
      after:pointer-events-none after:absolute after:inset-0 after:z-0 after:bg-[linear-gradient(180deg,rgba(255,255,255,0.20),transparent_40%,rgba(0,0,0,0.03))] after:opacity-100
      ${className}`}
    >
      <div className="relative z-10">{children}</div>
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
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition duration-300 ease-out
      hover:-translate-y-1 hover:border-green-800/25 hover:shadow-[0_24px_48px_-26px_rgba(0,0,0,0.45)]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 active:translate-y-0
      ${className}`}
    >
      {children}
    </Link>
  )
}
