import Link from "next/link"
import type { ReactNode } from "react"

/** En-tête standard des écrans "Pages & conseils". */
export default function AdminPageHeader({
  title,
  subtitle,
  crumbs,
  actions,
}: {
  title: string
  subtitle?: string
  crumbs: { label: string; href?: string }[]
  actions?: ReactNode
}) {
  return (
    <div className="rb-surface p-4 sm:p-6">
      <nav aria-label="Fil d’Ariane admin">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-600">
          <li>
            <Link href="/admin" className="font-medium text-ink hover:underline underline-offset-4">
              Administration
            </Link>
          </li>
          {crumbs.map((c) => (
            <li key={c.label} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-line-strong">
                /
              </span>
              {c.href ? (
                <Link href={c.href} className="hover:underline underline-offset-4">
                  {c.label}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-ink sm:text-2xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-ink-600">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
