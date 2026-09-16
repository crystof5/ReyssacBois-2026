import Link from "next/link"
import { getCatalogHealth, type HealthItem } from "@/admin/queries/health"

const VISIBLE_MAX = 6

function ItemLink({ item, href }: { item: HealthItem; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm text-ink hover:bg-surface-2"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium group-hover:text-forest-700">{item.name}</span>
          {item.hint ? <span className="block truncate text-xs text-ink-400">{item.hint}</span> : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {!item.isVisible ? (
            <span className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400 ring-1 ring-line">
              Masqué
            </span>
          ) : null}
          <span aria-hidden="true" className="text-line-strong group-hover:text-forest-700">
            →
          </span>
        </span>
      </Link>
    </li>
  )
}

function HealthBlock({
  title,
  description,
  items,
  hrefOf,
  tone,
}: {
  title: string
  description: string
  items: HealthItem[]
  hrefOf: (item: HealthItem) => string
  tone: "alert" | "info"
}) {
  const count = items.length
  const ok = count === 0
  // Seuils : les orphelins sont plus graves que les catégories vides.
  const redFrom = tone === "alert" ? 5 : 15
  const level = ok ? "ok" : count >= redFrom ? "red" : "orange"
  const styles = {
    ok: { box: "border-forest-700/30", num: "bg-forest-050 text-forest-700 ring-forest-700/25" },
    orange: { box: "border-orange-300", num: "bg-orange-50 text-orange-600 ring-orange-300" },
    red: { box: "border-red-300", num: "bg-red-50 text-red-600 ring-red-300" },
  }[level]

  return (
    <section className={`flex flex-col rounded border border-t-4 bg-surface p-4 ${styles.box}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-sm font-bold text-ink">{title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-600">{description}</p>
        </div>
        <span
          className={`flex h-14 min-w-14 shrink-0 items-center justify-center rounded px-3 font-heading text-3xl font-extrabold leading-none tabular-nums ring-1 ${styles.num}`}
          aria-label={ok ? "Aucun" : `${count} élément${count > 1 ? "s" : ""}`}
        >
          {ok ? "✓" : count}
        </span>
      </div>

      {ok ? (
        <p className="mt-3 text-sm text-forest-800">Rien à signaler.</p>
      ) : (
        <>
          <ul className="mt-3 -mx-2 space-y-0.5">
            {items.slice(0, VISIBLE_MAX).map((item) => (
              <ItemLink key={item.id} item={item} href={hrefOf(item)} />
            ))}
          </ul>
          {count > VISIBLE_MAX ? (
            <details className="group/more mt-1">
              <summary className="cursor-pointer list-none px-0 py-1 text-xs font-semibold text-forest-700 hover:underline">
                <span className="group-open/more:hidden">Voir les {count - VISIBLE_MAX} autres</span>
                <span className="hidden group-open/more:inline">Réduire</span>
              </summary>
              <ul className="-mx-2 space-y-0.5">
                {items.slice(VISIBLE_MAX).map((item) => (
                  <ItemLink key={item.id} item={item} href={hrefOf(item)} />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </section>
  )
}

/** Encart "À vérifier" du tableau de bord : éléments du catalogue mal rattachés ou vides. */
export default async function AdminHealthPanel() {
  const health = await getCatalogHealth()
  const alerts = health.orphanProducts.length + health.orphanCategories.length

  return (
    <div className="rb-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold text-ink">À vérifier dans le catalogue</h2>
        <span className="text-xs text-ink-400">
          {alerts ? `${alerts} élément${alerts > 1 ? "s" : ""} non visible${alerts > 1 ? "s" : ""} dans le catalogue public` : "Catalogue bien rattaché"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <HealthBlock
          title="Produits orphelins"
          description="Rattachés à aucune catégorie : ils n'apparaissent pas dans le catalogue."
          items={health.orphanProducts}
          hrefOf={(item) => `/admin/produits/${item.id}`}
          tone="alert"
        />
        <HealthBlock
          title="Catégories orphelines"
          description="Parent introuvable, ou racine non cochée « principale » : absentes du menu."
          items={health.orphanCategories}
          hrefOf={(item) => `/admin/categories/${item.id}`}
          tone="alert"
        />
        <HealthBlock
          title="Catégories vides"
          description="Sans produit ni sous-catégorie. Normal si le contenu est dans la description."
          items={health.emptyCategories}
          hrefOf={(item) => `/admin/categories/${item.id}`}
          tone="info"
        />
      </div>
    </div>
  )
}
