import Link from "next/link"

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`rb-surface ${className}`}>{children}</div>
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
    <Link href={href} className={`rb-card-interactive group ${className}`}>
      {children}
    </Link>
  )
}
