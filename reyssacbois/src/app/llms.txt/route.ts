import { getCategoriesTree } from "@/lib/categories"
import { listCustomCategorySeo } from "@/lib/categorySeo"
import { absoluteUrl } from "@/lib/seo"
import {
  AGEN_AREA_CITIES,
  BUSINESS,
  BUSINESS_ADDRESS_ONE_LINE,
  EXTENDED_DELIVERY_CITIES,
} from "@/lib/business"

// llms.txt (https://llmstxt.org) : résumé factuel du site pour les moteurs IA (GEO).
export const revalidate = 86400

type Node = { slug: string; children?: Node[] }

function collectSlugs(nodes: Node[], out = new Set<string>()): Set<string> {
  for (const n of nodes) {
    out.add(n.slug)
    if (n.children?.length) collectSlugs(n.children, out)
  }
  return out
}

export async function GET() {
  const visible = collectSlugs((await getCategoriesTree()) as unknown as Node[])
  const categories = listCustomCategorySeo().filter((c) => visible.has(c.slug))

  const body = `# ${BUSINESS.name}

> ${BUSINESS.name} est un négoce et magasin de bois familial fondé en ${BUSINESS.foundingYear} (scierie jusqu'en 1970), situé à Boé, aux portes d'Agen (Lot-et-Garonne, Nouvelle-Aquitaine). Il vend aux particuliers et aux professionnels du bois de charpente, des contreplaqués et panneaux, du bois de menuiserie, du parquet, du lambris, du bardage, des terrasses bois et de la quincaillerie, avec découpe sur mesure et livraison.

## Informations pratiques

- Adresse : ${BUSINESS_ADDRESS_ONE_LINE}, France (agglomération d'Agen)
- Téléphone : ${BUSINESS.phoneDisplay}
- Horaires : ${BUSINESS.openingHours.display}. Fermé le samedi et le dimanche.
- Clientèle : particuliers, artisans, entreprises, collectivités
- Services : conseil, retrait sur place, débit de bois sur liste, découpe de panneaux sur mesure, travail à façon (rabotage, collage, ponçage), fabrication sur mesure, livraison
- Zone prioritaire : ${AGEN_AREA_CITIES.join(", ")}
- Livraison : tout le Lot-et-Garonne (47), le Gers (32) et le Tarn-et-Garonne (82) ; plus loin sur devis (${EXTENDED_DELIVERY_CITIES.join(", ")})
- Devis : ${absoluteUrl("/#contact")}

## Catalogue

- [Catalogue complet](${absoluteUrl("/produits")}): toutes les familles de produits bois
${categories.map((c) => `- [${c.title}](${absoluteUrl(`/categories/${c.slug}`)}): ${c.description}`).join("\n")}

## Entreprise

- [Accueil, histoire et FAQ](${absoluteUrl("/")}): entreprise familiale transmise sur cinq générations, plus ancien commerce d'Agen
- [Mentions légales](${absoluteUrl("/mentions-legales")})
`

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
