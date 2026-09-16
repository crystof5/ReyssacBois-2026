import Breadcrumb from "@/components/Breadcrumb"

/** En-tête des pages éditoriales (services, entreprise, contact). */
export default function PageHeader({
  eyebrow,
  title,
  crumb,
  children,
}: {
  eyebrow: string
  title: string
  crumb: { name: string; href: string }
  children?: React.ReactNode
}) {
  return (
    <>
      <div className="hidden md:block">
        <Breadcrumb items={[{ id: crumb.href, ...crumb }]} />
      </div>
      <header className="rounded-3xl border border-white/15 bg-white/60 p-6 sm:p-8 backdrop-blur shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold tracking-wide text-green-800/90">{eyebrow}</p>
        <h1 className="mt-2 text-2xl sm:text-4xl font-bold text-gray-900">{title}</h1>
        {children ? (
          <div className="mt-4 max-w-3xl space-y-3 text-base sm:text-lg leading-relaxed text-gray-700">
            {children}
          </div>
        ) : null}
      </header>
    </>
  )
}

/** Carte de contenu standard des pages éditoriales. */
export function PageCard({
  title,
  children,
  className = "",
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-3xl border border-white/15 bg-white/60 p-6 sm:p-7 backdrop-blur shadow-sm ring-1 ring-black/5 ${className}`}
    >
      {title ? <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2> : null}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </section>
  )
}
