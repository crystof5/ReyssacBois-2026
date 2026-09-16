import Link from "next/link"
import AdminPageHeader from "@/admin/components/editorial/AdminPageHeader"
import { getAdminArticles } from "@/admin/queries/editorial"
import { createArticleAction, moveArticleAction, toggleArticleAction } from "@/admin/actions/editorial"

export const dynamic = "force-dynamic"

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" })
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`

export default async function AdminConseilsPage() {
  const articles = await getAdminArticles()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Conseils"
        subtitle="Les guides pratiques affichés sur /conseils et sur les catégories liées."
        crumbs={[{ label: "Pages & conseils", href: "/admin/pages" }, { label: "Conseils" }]}
        actions={
          <>
            <a href="/conseils" target="_blank" rel="noopener" className="rb-btn rb-btn-secondary">
              Voir la rubrique ↗
            </a>
            <form action={createArticleAction}>
              <button type="submit" className="rb-btn rb-btn-primary">
                + Nouveau guide
              </button>
            </form>
          </>
        }
      />

      {articles.length === 0 ? (
        <div className="rb-surface p-10 text-center">
          <p className="text-4xl" aria-hidden="true">
            📚
          </p>
          <p className="mt-3 font-heading text-lg font-bold text-ink">Aucun guide pour l&apos;instant</p>
          <p className="mt-1 text-sm text-ink-600">Cliquez sur « Nouveau guide » pour commencer.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {articles.map((a, i) => (
            <li key={a.id} className="rb-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-1.5 sm:flex-col">
                {(["up", "down"] as const).map((dir) => (
                  <form key={dir} action={moveArticleAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <button
                      type="submit"
                      disabled={dir === "up" ? i === 0 : i === articles.length - 1}
                      aria-label={dir === "up" ? "Monter" : "Descendre"}
                      className="flex h-7 w-7 items-center justify-center rounded border border-line text-ink-600 hover:border-forest-700/40 hover:text-forest-700 disabled:opacity-30"
                    >
                      {dir === "up" ? "↑" : "↓"}
                    </button>
                  </form>
                ))}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                      a.isVisible ? "bg-forest-050 text-forest-800" : "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                    }`}
                  >
                    {a.isVisible ? "Publié" : "Brouillon"}
                  </span>
                  <span className="text-xs text-ink-400">
                    {plural(a.sections.length, "partie")} · {plural(a.faq.length, "question")} ·{" "}
                    {plural(a.related.length, "catégorie")} liée{a.related.length > 1 ? "s" : ""}
                  </span>
                </div>
                <Link href={`/admin/conseils/${a.id}`} className="mt-1 block font-heading text-base font-bold text-ink hover:text-forest-700">
                  {a.title}
                </Link>
                <p className="mt-0.5 truncate text-sm text-ink-600">{a.excerpt || "Pas encore de résumé."}</p>
                <p className="mt-1 text-xs text-ink-400">
                  /conseils/{a.slug} · modifié le {dateFormat.format(new Date(a.updatedAt || a.publishedAt))}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <form action={toggleArticleAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="rb-btn rb-btn-secondary">
                    {a.isVisible ? "Dépublier" : "Publier"}
                  </button>
                </form>
                {a.isVisible ? (
                  <a href={`/conseils/${a.slug}`} target="_blank" rel="noopener" className="rb-btn rb-btn-secondary">
                    Voir ↗
                  </a>
                ) : null}
                <Link href={`/admin/conseils/${a.id}`} className="rb-btn rb-btn-primary">
                  Modifier
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
