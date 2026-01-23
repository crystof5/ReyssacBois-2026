import Link from "next/link"
import { getAdminProduits } from "@/admin/queries/produits"
import { createProduitAction, deleteProduitIfOrphanAction } from "@/admin/actions/produits"

type SearchParams = Record<string, string | string[] | undefined>

export default async function AdminProduitsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const sp = (await searchParams) ?? {}
  const q = typeof sp.q === "string" ? sp.q.trim() : ""
  const vis = typeof sp.vis === "string" ? sp.vis : "all"

  const produitsRaw = await getAdminProduits()
  const produits = produitsRaw as unknown as Array<
    (typeof produitsRaw)[number] & {
      __validCategoryCount: number
      __totalCategoryLinks: number
      __hasBrokenCategoryLinks: boolean
    }
  >

  const orphans = produits.filter((p) => p.__validCategoryCount === 0)
  const brokenLinks = produits.filter((p) => p.__hasBrokenCategoryLinks)

  const qLower = q.toLowerCase()
  const filtered = produits.filter((p) => {
    if (qLower) {
      const name = p.name.toLowerCase()
      const slug = p.slug.toLowerCase()
      if (!name.includes(qLower) && !slug.includes(qLower)) return false
    }
    if (vis === "visible") return p.isVisible
    if (vis === "hidden") return !p.isVisible
    return true
  })

  return (
    <div>
      <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Produits</h2>
            <p className="mt-1 text-sm text-gray-700">
              Gère les fiches produits (visibilité, catégories, contenus).
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
                  <span className="font-semibold text-gray-900">Produits</span>
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <form action={createProduitAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
              >
                + Nouveau produit
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
                Retrouvez rapidement un produit (nom/slug) et filtrez les produits cachés.
              </p>
            </div>
            <form action="/admin/produits" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                <option value="all">Tous</option>
                <option value="visible">Visibles</option>
                <option value="hidden">Cachés</option>
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
                  {filtered.slice(0, 60).map((p) => (
                    <div key={p.id} className="rounded-2xl border border-white/25 bg-white/75 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="mt-0.5 text-xs text-gray-500 break-all">/{p.slug}</p>
                          <p className="mt-1 text-xs text-gray-600">
                            {p.__validCategoryCount} catégorie(s)
                            {p.__hasBrokenCategoryLinks ? (
                              <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                                Liens cassés
                              </span>
                            ) : null}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.isVisible ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {p.isVisible ? "Visible" : "Caché"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/produits/${p.id}`}
                          className="inline-flex items-center justify-center rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                        >
                          Éditer
                        </Link>
                        <Link
                          href={`/produits/${p.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white"
                        >
                          Voir →
                        </Link>
                        {p.__validCategoryCount === 0 ? (
                          <form action={deleteProduitIfOrphanAction}>
                            <input type="hidden" name="id" value={p.id} />
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
                Astuce: sélectionne <span className="font-medium">“Cachés”</span> pour retrouver les produits non visibles.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Produits orphelins (non rattachés)
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Produits sans catégorie valide (y compris liens cassés): ils ne seront jamais listés côté public.
              </p>
            </div>
            <span className="text-xs text-gray-500">
              Total: <span className="font-medium text-gray-900">{orphans.length}</span>
            </span>
          </div>

          {orphans.length ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orphans.slice(0, 60).map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/25 bg-white/75 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500 break-all">/{p.slug}</p>
                      {p.__hasBrokenCategoryLinks ? (
                        <p className="mt-1 text-xs text-amber-900">
                          Liens cassés détectés (catégorie supprimée / DB incohérente).
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.isVisible ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.isVisible ? "Visible" : "Caché"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                    >
                      Éditer (rattacher)
                    </Link>
                    <form action={deleteProduitIfOrphanAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">Aucun produit orphelin détecté.</p>
          )}
        </div>

        {brokenLinks.length ? (
          <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Liens cassés (produits ↔ catégories)
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Produits ayant au moins un rattachement vers une catégorie inexistante. Ouvre et enregistre le produit pour nettoyer / corriger.
                </p>
              </div>
              <span className="text-xs text-gray-500">
                Total: <span className="font-medium text-gray-900">{brokenLinks.length}</span>
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {brokenLinks.slice(0, 30).map((p) => (
                <div key={p.id} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="mt-0.5 text-xs text-gray-600 break-all">/{p.slug}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50"
                    >
                      Ouvrir / corriger
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {brokenLinks.length > 30 ? (
              <p className="mt-3 text-xs text-gray-500">
                Affichage limité à 30 (utilise la recherche si besoin).
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Tous les produits</h3>
              <p className="mt-1 text-xs text-gray-500">
                Liste d’édition (pas de ré-ordonnancement global ici: l’ordre se gère dans les catégories).
              </p>
            </div>
            <span className="text-xs text-gray-500">
              Total: <span className="font-medium text-gray-900">{produits.length}</span>
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {produits.slice(0, 60).map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/25 bg-white/75 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500 break-all">/{p.slug}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      {(p as typeof produits[number]).__validCategoryCount} catégorie(s)
                      {(p as typeof produits[number]).__hasBrokenCategoryLinks ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                          Liens cassés
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.isVisible ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.isVisible ? "Visible" : "Caché"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/produits/${p.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                  >
                    Éditer
                  </Link>
                  <Link
                    href={`/produits/${p.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-white"
                  >
                    Voir →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {produits.length > 60 ? (
            <p className="mt-3 text-xs text-gray-500">
              Affichage limité à 60 produits (utilise la recherche pour trouver un produit précis).
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}


