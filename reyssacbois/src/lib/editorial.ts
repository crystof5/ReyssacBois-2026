import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { CATEGORY_TO_ARTICLE, LEGACY_ARTICLES } from "@/lib/articles"
import { AGEN_AREA_CITIES } from "@/lib/business"
import { escapeHtml, toRichHtml } from "@/lib/richHtml"

/**
 * Contenus éditoriaux éditables dans l'admin (guides Conseils, pages Livraison / Découpe).
 * Stockés dans SiteSetting (JSON) : aucune migration de schéma.
 * Tant que rien n'est enregistré, on sert le contenu par défaut ci-dessous.
 */

export const EDITORIAL_KEYS = {
  articles: "content.articles",
  livraison: "page.livraison",
  decoupe: "page.decoupe",
} as const

export type FaqEntry = { id: string; question: string; answer: string }

export type ArticleSection = { id: string; heading: string; html: string }

export type Article = {
  id: string
  slug: string
  isVisible: boolean
  title: string
  metaTitle: string
  description: string
  excerpt: string
  intro: string
  publishedAt: string
  updatedAt: string
  sections: ArticleSection[]
  faq: FaqEntry[]
  /** Slugs des catégories du catalogue liées. */
  related: string[]
}

export type PageSeo = { metaTitle: string; description: string }

export type LivraisonZone = { id: string; badge: string; title: string; text: string; places: string[] }
export type Step = { id: string; title: string; text: string }

export type LivraisonPage = PageSeo & {
  title: string
  introHtml: string
  zones: LivraisonZone[]
  steps: Step[]
  faq: FaqEntry[]
  bandHeading: string
  bandText: string
}

export type DecoupePage = PageSeo & {
  title: string
  introHtml: string
  orderInfos: string[]
  otherWorksHtml: string
  faq: FaqEntry[]
  bandHeading: string
  bandText: string
}

// ---------------------------------------------------------------------------
// Contenus par défaut
// ---------------------------------------------------------------------------

const DEFAULT_ARTICLES: Article[] = LEGACY_ARTICLES.map((a, i) => ({
  id: `article-${i + 1}`,
  slug: a.slug,
  isVisible: true,
  title: a.title,
  metaTitle: a.metaTitle,
  description: a.description,
  excerpt: a.excerpt,
  intro: a.intro,
  publishedAt: a.publishedAt,
  updatedAt: a.publishedAt,
  sections: a.sections.map((s, j) => ({
    id: `article-${i + 1}-s${j + 1}`,
    heading: s.heading,
    html: toRichHtml(s.paragraphs, s.list),
  })),
  faq: a.faq.map((f, j) => ({ id: `article-${i + 1}-f${j + 1}`, ...f })),
  related: a.related.map((r) => r.slug),
}))

const DEFAULT_LIVRAISON: LivraisonPage = {
  metaTitle: "Livraison de bois à Agen, Lot-et-Garonne, Gers, Tarn-et-Garonne",
  description:
    "Livraison de bois de charpente, panneaux, contreplaqués, bardage et terrasse dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne.",
  title: "Livraison de bois à Agen et dans le Sud-Ouest",
  introHtml: `<p>${escapeHtml(
    "Reyssac Bois livre votre bois depuis son dépôt de Boé, aux portes d'Agen : bois de charpente, contreplaqués et panneaux, bois de menuiserie, bardage, terrasses, parquet et quincaillerie, pour les particuliers comme pour les professionnels.",
  )}</p>`,
  zones: [
    {
      id: "zone-1",
      badge: "Zone prioritaire",
      title: "Agen et son agglomération",
      text: "Au départ de notre dépôt de Boé, nous livrons en priorité Agen et les communes voisines :",
      places: [...AGEN_AREA_CITIES],
    },
    {
      id: "zone-2",
      badge: "Livraisons régulières",
      title: "Lot-et-Garonne, Gers et Tarn-et-Garonne",
      text: "Nous livrons dans tout le Lot-et-Garonne (47) et les départements voisins du Gers (32) et du Tarn-et-Garonne (82), par exemple :",
      places: ["Villeneuve-sur-Lot", "Marmande", "Nérac", "Casteljaloux", "Tonneins", "Fumel", "Auch", "Condom", "Lectoure", "Montauban", "Moissac", "Valence d'Agen"],
    },
    {
      id: "zone-3",
      badge: "Sur devis",
      title: "De Bordeaux à Toulouse",
      text: "Au-delà, nous étudions chaque demande selon le volume et la distance, le long de l'axe Garonne :",
      places: ["Bordeaux", "Langon", "Toulouse", "Castelsarrasin"],
    },
  ],
  steps: [
    { id: "step-1", title: "Votre demande", text: "Appelez-nous ou envoyez votre liste (produits, sections, longueurs, quantités) et l'adresse de livraison." },
    { id: "step-2", title: "Votre devis", text: "Nous vérifions la disponibilité et chiffrons la marchandise et la livraison, calculée selon le volume et la distance." },
    { id: "step-3", title: "La préparation", text: "Votre commande est préparée au dépôt de Boé, avec la découpe sur mesure des panneaux si besoin." },
    { id: "step-4", title: "La livraison", text: "Nous livrons à l'adresse convenue : chantier, entreprise ou domicile." },
  ],
  faq: [
    { id: "lf-1", question: "Livrez-vous les particuliers ?", answer: "Oui. Nous livrons aussi bien les particuliers que les artisans, entreprises et collectivités, dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne." },
    { id: "lf-2", question: "Combien coûte la livraison ?", answer: "Le prix de la livraison dépend du volume, du poids et de la distance. Il est indiqué dans votre devis avant toute commande." },
    { id: "lf-3", question: "Livrez-vous à Bordeaux ou à Toulouse ?", answer: "Oui, sur devis. Pour les livraisons au-delà du Lot-et-Garonne et des départements voisins, nous étudions chaque demande selon le volume et la distance." },
    { id: "lf-4", question: "Puis-je faire découper mes panneaux avant la livraison ?", answer: "Oui. Nous découpons vos panneaux sur mesure dans notre atelier de Boé avant de les livrer." },
    { id: "lf-5", question: "Puis-je venir chercher ma commande au dépôt ?", answer: "Oui. Le retrait se fait à notre dépôt de Boé, aux portes d'Agen, du lundi au vendredi de 8h30 à 12h et de 14h à 18h." },
  ],
  bandHeading: "Livraison de bois depuis Boé, près d'Agen",
  bandText:
    "Négoce familial depuis 1850, Reyssac Bois prépare et livre vos commandes de bois et de panneaux dans l'agglomération d'Agen, tout le Lot-et-Garonne, le Gers et le Tarn-et-Garonne. Pour les chantiers plus éloignés, de Bordeaux à Toulouse, contactez-nous : nous étudions votre demande sur devis.",
}

const DEFAULT_DECOUPE: DecoupePage = {
  metaTitle: "Découpe de panneaux bois sur mesure à Agen (Boé)",
  description:
    "Découpe sur mesure de contreplaqué, OSB, MDF, aggloméré, mélaminé et lamellé-collé à Boé près d'Agen. Pour particuliers et pros. Retrait ou livraison.",
  title: "Découpe de panneaux bois sur mesure à Agen",
  introHtml: `<p>${escapeHtml(
    "Depuis des décennies, Reyssac Bois découpe vos panneaux à vos cotes dans son atelier de Boé, aux portes d'Agen. Vous repartez avec des pièces prêtes à poser, sans chutes à gérer ni grands formats à transporter.",
  )}</p>`,
  orderInfos: [
    "les dimensions de chaque pièce (longueur × largeur) et les quantités ;",
    "le type de panneau et l'épaisseur souhaités ;",
    "le sens du fil ou du décor, si c'est important pour votre projet ;",
    "le retrait au dépôt ou l'adresse de livraison.",
  ],
  otherWorksHtml: `<p>${escapeHtml(
    "Héritier de la scierie familiale, notre atelier réalise aussi le rabotage, le collage, le ponçage et de petits travaux de menuiserie sur mesure.",
  )}</p>`,
  faq: [
    { id: "df-1", question: "Faites-vous la découpe pour les particuliers ?", answer: "Oui. La découpe de panneaux sur mesure est proposée aux particuliers comme aux professionnels, dans notre dépôt de Boé près d'Agen." },
    { id: "df-2", question: "Quelles informations dois-je fournir ?", answer: "Indiquez le type de panneau, l'épaisseur, les dimensions de chaque pièce et les quantités. Une liste de débit, même manuscrite, suffit." },
    { id: "df-3", question: "Peut-on faire livrer les panneaux découpés ?", answer: "Oui. Les panneaux découpés peuvent être retirés au dépôt ou livrés dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne." },
    { id: "df-4", question: "Quel est le délai pour une découpe ?", answer: "Il dépend de la quantité et de la disponibilité des panneaux. Contactez-nous avec votre liste : nous vous indiquons le délai avec le devis." },
  ],
  bandHeading: "Découpe de panneaux à Boé, aux portes d'Agen",
  bandText:
    "Contreplaqué, OSB, médium, aggloméré ou lamellé-collé : choisissez votre panneau dans notre stock et repartez avec des pièces découpées à vos dimensions. Service proposé aux particuliers et aux professionnels, avec retrait au dépôt ou livraison.",
}

export function getDefaultArticles() {
  return DEFAULT_ARTICLES
}
export function getDefaultLivraison() {
  return DEFAULT_LIVRAISON
}
export function getDefaultDecoupe() {
  return DEFAULT_DECOUPE
}

// ---------------------------------------------------------------------------
// Lecture (cache invalidé par l'admin via revalidateTag("siteSettings"))
// ---------------------------------------------------------------------------

const readSetting = unstable_cache(
  async (key: string) => {
    const row = await prisma.siteSetting.findUnique({ where: { key }, select: { value: true } })
    return (row?.value ?? null) as unknown
  },
  ["editorialSetting"],
  { revalidate: 60 * 30, tags: ["siteSettings"] },
)

export async function getAllArticles(): Promise<Article[]> {
  const value = (await readSetting(EDITORIAL_KEYS.articles)) as { items?: Article[] } | null
  return Array.isArray(value?.items) ? value.items : DEFAULT_ARTICLES
}

export async function getPublishedArticles(): Promise<Article[]> {
  return (await getAllArticles()).filter((a) => a.isVisible && a.slug)
}

export async function getPublishedArticle(slug: string) {
  return (await getPublishedArticles()).find((a) => a.slug === slug) ?? null
}

/**
 * Guide lié à un chemin de catégories (de la racine à la feuille) :
 * d'abord un guide qui cite explicitement la catégorie, en partant de la feuille,
 * puis la correspondance par défaut.
 */
export async function getArticleForCategoryPath(slugs: string[]) {
  const articles = await getPublishedArticles()
  for (const slug of [...slugs].reverse()) {
    const explicit = articles.find((a) => a.related.includes(slug))
    if (explicit) return explicit
    const fallback = CATEGORY_TO_ARTICLE[slug]
    const byDefault = fallback ? articles.find((a) => a.slug === fallback) : undefined
    if (byDefault) return byDefault
  }
  return null
}

export async function getLivraisonPage(): Promise<LivraisonPage> {
  const value = (await readSetting(EDITORIAL_KEYS.livraison)) as Partial<LivraisonPage> | null
  return { ...DEFAULT_LIVRAISON, ...(value ?? {}) }
}

export async function getDecoupePage(): Promise<DecoupePage> {
  const value = (await readSetting(EDITORIAL_KEYS.decoupe)) as Partial<DecoupePage> | null
  return { ...DEFAULT_DECOUPE, ...(value ?? {}) }
}
