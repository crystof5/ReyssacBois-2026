import { getCategoriesTree } from "@/lib/categories"

/**
 * Produits phares mis en avant (footer, accueil) : maillage interne vers les pages
 * qui doivent se positionner sur "<produit> Agen".
 */
const FEATURED_LINKS: { slug: string; label: string }[] = [
  { slug: "contreplaques", label: "Contreplaqués" },
  { slug: "charpente", label: "Bois de charpente" },
  { slug: "poteaux-poutres", label: "Poteaux & poutres" },
  { slug: "madriers-bastaings", label: "Madriers & bastaings" },
  { slug: "solives-solivettes", label: "Solives" },
  { slug: "chevrons-demi-chevrons", label: "Chevrons" },
  { slug: "bois-de-menuiserie-ebenisterie", label: "Bois de menuiserie" },
  { slug: "exotiques", label: "Bois exotiques" },
  { slug: "sapin-du-nord", label: "Sapin du Nord" },
  { slug: "panneaux", label: "Panneaux bois" },
  { slug: "osb-3", label: "OSB" },
  { slug: "parquet", label: "Parquet" },
  { slug: "lambris", label: "Lambris" },
  { slug: "bardage", label: "Bardage bois" },
  { slug: "terrasses", label: "Terrasses bois" },
  { slug: "rondins-demi-rondins-piquets-clotures-traverses-paysageres", label: "Rondins & clôtures" },
  { slug: "planches-de-caissage-coffrage", label: "Planches de coffrage" },
  { slug: "tasseaux", label: "Tasseaux" },
  { slug: "moulures", label: "Moulures" },
  { slug: "portes-blocs-portes", label: "Portes & blocs-portes" },
  { slug: "quincaillerie", label: "Quincaillerie" },
  { slug: "fabrication-sur-mesure", label: "Fabrication sur mesure" },
]

export const FEATURED_CATEGORY_SLUGS = FEATURED_LINKS.map((l) => l.slug)

type Node = { slug: string; children?: Node[] }

function collectSlugs(nodes: Node[], out = new Set<string>()): Set<string> {
  for (const n of nodes) {
    out.add(n.slug)
    if (n.children?.length) collectSlugs(n.children, out)
  }
  return out
}

/** Ne renvoie que les liens dont la catégorie existe et est visible (pas de lien mort). */
export async function getFeaturedCategoryLinks() {
  const visible = collectSlugs((await getCategoriesTree()) as unknown as Node[])
  return FEATURED_LINKS.filter((l) => visible.has(l.slug)).map((l) => ({
    ...l,
    href: `/categories/${l.slug}`,
  }))
}
