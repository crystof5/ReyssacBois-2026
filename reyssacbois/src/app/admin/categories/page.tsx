import Link from "next/link"
import { Fragment } from "react"
import { getAdminCategories } from "@/admin/queries/categories"
import { getDbDiagnostics } from "@/admin/queries/diagnostics"
import SortableList from "@/admin/components/SortableList"
import { createCategoryAction, deleteCategoryIfOrphanAction } from "@/admin/actions/categories"

type SearchParams = Record<string, string | string[] | undefined>

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const sp = (await searchParams) ?? {}
  const q = typeof sp.q === "string" ? sp.q.trim() : ""
  const vis = typeof sp.vis === "string" ? sp.vis : "all"

  const [categories, diag] = await Promise.all([getAdminCategories(), getDbDiagnostics()])
  // Racines (sans parent)
  const rootsAll = categories.filter((c) => !c.parentId)
  // Catégories principales (affichées dans la sidebar)
  const parents = categories.filter((c) => !c.parentId && c.isTopCategory)
  const children = categories.filter((c) => !!c.parentId)
  // Catégories “hors menu” = sans parent mais non marquées “principales”
  const orphans = categories.filter((c) => !c.parentId && !c.isTopCategory)
  const brokenParents = categories.filter((c) => !!c.parentId && !c.parent)

  const qLower = q.toLowerCase()
  const matchesQuery = (name: string, slug: string) => {
    if (!qLower) return true
    return name.toLowerCase().includes(qLower) || slug.toLowerCase().includes(qLower)
  }

  const filtered = categories.filter((c) => {
    if (!matchesQuery(c.name, c.slug)) return false
    if (vis === "visible") return c.isVisible
    if (vis === "hidden") return !c.isVisible
    return true
  })

  const sortFr = (a: (typeof categories)[number], b: (typeof categories)[number]) => {
    const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (byOrder !== 0) return byOrder
    return a.name.localeCompare(b.name, "fr")
  }

  const childrenByParentId = new Map<string, (typeof categories)[number][]>()
  for (const c of categories) {
    if (!c.parentId) continue
    const arr = childrenByParentId.get(c.parentId) ?? []
    arr.push(c)
    childrenByParentId.set(c.parentId, arr)
  }
  for (const [, arr] of childrenByParentId) arr.sort(sortFr)

  return (
    <div>
      <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Catégories</h2>
            <p className="mt-1 text-sm text-gray-700">
              L’ordre des <span className="font-medium">catégories principales</span> correspond à la sidebar.
            </p>

            <nav aria-label="Fil d’Ariane admin" className="mt-3">
              <ol className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-white/20 bg-white/65 px-3 py-2 text-xs text-gray-700 shadow-sm ring-1 ring-black/5 backdrop-blur">
                <li className="min-w-0">
                  <Link href="/admin" className="font-medium text-gray-900 hover:underline underline-offset-4">
                    Administration
                  </Link>
                </li>
                <li className="flex min-w-0 items-center gap-1">
                  <span className="text-gray-400" aria-hidden>
                    /
                  </span>
                  <span className="font-semibold text-gray-900">Catégories</span>
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <form action={createCategoryAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
              >
                + Nouvelle catégorie
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Recherche / visibilité</h3>
              <p className="mt-1 text-xs text-gray-500">
                Retrouvez rapidement une catégorie (nom/slug) et filtrez les catégories cachées.
              </p>
            </div>
            <form action="/admin/categories" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                name="q"
                defaultValue={q}
                placeholder="Rechercher…"
                className="w-full sm:w-72 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              />
              <select
                name="vis"
                defaultValue={vis}
                className="w-full sm:w-44 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              >
                <option value="all">Toutes</option>
                <option value="visible">Visibles</option>
                <option value="hidden">Cachées</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
              >
                Filtrer
              </button>
            </form>
          </div>

          <div className="mt-4">
            {q || vis !== "all" ? (
              <>
                <p className="text-xs text-gray-500">
                  Résultats: <span className="font-medium text-gray-900">{filtered.length}</span>
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.slice(0, 60).map((c) => (
                    <div key={c.id} className="rounded-2xl border border-white/25 bg-white/75 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                          <p className="mt-0.5 text-xs text-gray-500 break-all">/{c.slug}</p>
                          <p className="mt-1 text-xs text-gray-600">
                            Parent: <span className="font-medium">{c.parent?.name ?? "—"}</span>
                          </p>
                          <p className="mt-1 text-xs text-gray-600">
                            {c._count.children} sous-cat. • {c._count.products} produits
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.isVisible ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {c.isVisible ? "Visible" : "Cachée"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/categories/${c.id}`}
                          className="inline-flex items-center justify-center rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                        >
                          Éditer
                        </Link>
                        <Link
                          href={`/categories/${c.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white"
                        >
                          Voir →
                        </Link>
                        {c._count.children === 0 && c._count.products === 0 ? (
                          <form action={deleteCategoryIfOrphanAction}>
                            <input type="hidden" name="id" value={c.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              Supprimer
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                {filtered.length > 60 ? (
                  <p className="mt-3 text-xs text-gray-500">
                    Affichage limité à 60 résultats (affine la recherche).
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-xs text-gray-500">
                Astuce: sélectionne <span className="font-medium">“Cachées”</span> pour retrouver les catégories non visibles.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Catégories sans parent (hors menu)</h3>
              <p className="mt-1 text-xs text-gray-500">
                Catégories avec <span className="font-medium">aucun parent</span> et non marquées “catégorie principale”.
              </p>
            </div>
            <span className="text-xs text-gray-500">
              Total: <span className="font-medium text-gray-900">{orphans.length}</span>
            </span>
          </div>

          {orphans.length ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orphans.slice(0, 60).map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/25 bg-white/75 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500 break-all">/{c.slug}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        Parent: <span className="font-medium">{c.parent?.name ?? "—"}</span>
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {c._count.children} sous-cat. • {c._count.products} produits
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.isVisible ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.isVisible ? "Visible" : "Cachée"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                    >
                      Éditer
                    </Link>
                    <Link
                      href={`/categories/${c.slug}`}
                      className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white"
                    >
                      Voir →
                    </Link>
                    {c._count.children === 0 && c._count.products === 0 ? (
                      <form action={deleteCategoryIfOrphanAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">Aucune catégorie sans parent (hors menu) détectée.</p>
          )}
        </div>

        {brokenParents.length ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.45)] ring-1 ring-black/10 backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Liens cassés (sous-catégories)
                </h3>
                <p className="mt-1 text-xs text-gray-700">
                  Sous-catégories avec <span className="font-medium">parentId</span> renseigné mais parent introuvable. Ouvre et choisis un nouveau parent (ou “Aucun”).
                </p>
              </div>
              <span className="text-xs text-gray-700">
                Total: <span className="font-medium text-gray-900">{brokenParents.length}</span>
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {brokenParents.slice(0, 30).map((c) => (
                <div key={c.id} className="rounded-2xl border border-amber-200 bg-white/75 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="mt-0.5 text-xs text-gray-600 break-all">/{c.slug}</p>
                  <p className="mt-1 text-xs text-gray-700">
                    Parent: <span className="font-medium">introuvable</span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50"
                    >
                      Ouvrir / corriger
                    </Link>
                    {c._count.children === 0 && c._count.products === 0 ? (
                      <form action={deleteCategoryIfOrphanAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {brokenParents.length > 30 ? (
              <p className="mt-3 text-xs text-gray-700">
                Affichage limité à 30 (utilise la recherche si besoin).
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-900">État</h3>
          <p className="mt-1 text-xs text-gray-500">
            Résumé des contenus (catégories / produits).
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Catégories</div>
              <div className="font-semibold text-gray-900">
                {diag.categoriesTotal}{" "}
                <span className="text-xs font-normal text-gray-500">
                  ({diag.categoriesParents} parents / {diag.categoriesChildren} enfants)
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="text-xs text-gray-500">Produits</div>
              <div className="font-semibold text-gray-900">{diag.productsTotal}</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-900">Arborescence (tous niveaux)</h3>
          <p className="mt-1 text-xs text-gray-500">
            Indentation = niveau. Pour réordonner des sous-catégories, ouvre le parent puis glisse-dépose.
          </p>

          <div className="mt-4 rounded-2xl border border-white/25 bg-white/75 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <ul className="divide-y divide-black/5">
              {rootsAll.map((root) => {
                const render = (
                  node: (typeof categories)[number],
                  level: number,
                  path: string[],
                ) => {
                  const nextPath = [...path, node.name]
                  const kids = childrenByParentId.get(node.id) ?? []
                  const blocks: any[] = []

                  blocks.push(
                    <li
                      key={node.id}
                      className="px-3 py-2.5"
                      style={{ paddingLeft: 12 + level * 28 }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{node.name}</p>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                node.isVisible ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {node.isVisible ? "Visible" : "Cachée"}
                            </span>
                            <span className="text-xs text-gray-600">
                              {node._count.children} sous-cat. • {node._count.products} produits
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500 break-all">/{node.slug}</p>
                          {level > 0 ? (
                            <p className="mt-1 text-[11px] text-gray-600 rb-clamp-1" title={nextPath.join(" / ")}>
                              Chemin: {nextPath.join(" / ")}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/categories/${node.id}`}
                            className="inline-flex items-center justify-center rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                          >
                            Éditer
                          </Link>
                          <Link
                            href={`/categories/${node.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white"
                          >
                            Voir →
                          </Link>
                        </div>
                      </div>
                    </li>
                  )

                  for (const k of kids) {
                    blocks.push(...render(k, level + 1, nextPath))
                  }

                  return blocks
                }

                return <Fragment key={root.id}>{render(root, 0, [])}</Fragment>
              })}
            </ul>
          </div>
        </div>

        <SortableList
          title="Catégories principales (ordre sidebar)"
          description="Glisse-dépose pour réordonner. Cet ordre est celui du menu catégories côté public."
          items={parents.map((c) => ({
            id: c.id,
            title: c.name,
            subtitle: `/${c.slug}`,
            rightNote: `${c._count.children} sous-cat. • ${c._count.products} produits`,
            isVisible: c.isVisible,
            editHref: `/admin/categories/${c.id}`,
            viewHref: `/categories/${c.slug}`,
          }))}
          saveKind="topCategories"
        />
      </div>
    </div>
  )
}


