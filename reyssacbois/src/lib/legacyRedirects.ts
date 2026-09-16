/**
 * Ancien site (avant janvier 2026) : /materiel/<slug>, /categorie/<slug>, /item/<slug>, /nos-produits.
 * Redirection 301 vers l'équivalent actuel (transfert de l'historique SEO), sinon vers le catalogue.
 * Source : scripts/categories_202601180952.csv (catégories legacy).
 */
const LEGACY_CATEGORY_TO_NEW: Record<string, string> = {
  "bois-de-menuiserie-de-pays": "bois-de-pays",
  "bois-de-menuiserie-exotique": "exotiques",
  charpente: "charpente",
  "lame-de-terrasse": "terrasses",
  "pin-sylvestre": "lames",
  "bardage-clin": "bardage",
  epicea: "bardage",
  "bois-autoclave": "amenagements-exterieurs",
  parquet: "parquet",
  lambris: "lambris",
  plinthe: "plinthe",
  planches: "planches-de-caissage-coffrage",
  "planches-echafaudage": "planches-de-caissage-coffrage",
  "moulures-tasseaux": "moulures",
  "colles-et-produits-de-traitement": "quincaillerie",
  quincaillerie: "quincaillerie",
  "sapin-du-nord": "sapin-du-nord",
  volets: "lames-a-volets",
  "sapin-nord-blanc": "lames-a-volets",
  "palapi-exotique": "palapi",
  panneaux: "panneaux",
  jalons: "jalons",
  "fabrication-sur-mesure": "fabrication-sur-mesure",
  "liteaux-contre-liteaux": "liteaux-demi-liteaux",
  voliges: "voliges",
  poteaux: "poteaux-poutres",
  "portes-blocs-portes": "portes-blocs-portes",
}

/** Renvoie le chemin cible si `pathname` est une URL de l'ancien site, sinon null. */
export function getLegacyRedirect(pathname: string): string | null {
  if (pathname === "/nos-produits") return "/produits"

  const match = /^\/(materiel|categorie|item)(?:\/([^/]+))?$/.exec(pathname)
  if (!match) return null

  const [, kind, slug] = match
  if (slug && kind !== "item") {
    let key = slug.toLowerCase()
    try {
      key = decodeURIComponent(slug).toLowerCase()
    } catch {
      // URL mal encodée : on garde le slug brut
    }
    const target = LEGACY_CATEGORY_TO_NEW[key]
    if (target) return `/categories/${target}`
  }
  return "/produits"
}
