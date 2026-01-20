import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"

export type SiteImage = {
  src: string
  alt: string
}

export type ProjectsCarouselSettings = {
  intervalMs: number
  slides: SiteImage[]
}

export const SITE_KEYS = {
  homeHero: "home.hero",
  homeFamily: "home.family",
  homeProjects: "home.projects",
  aboutHistory: "about.history",
  homeTexts: "home.texts",
  aboutTexts: "about.texts",
  promoModal: "site.promoModal",
  constructionBanner: "site.constructionBanner",
} as const

const SITE_SETTINGS_TAG = "siteSettings"

const getSettingCached = unstable_cache(
  async (key: string) => {
    return await prisma.siteSetting.findUnique({
      where: { key },
      select: { value: true },
    })
  },
  ["siteSetting"],
  {
    // Très important: cache serveur pour éviter de taper la DB à chaque request (Vercel + pooler).
    // L'admin invalide ce cache via revalidateTag(SITE_SETTINGS_TAG).
    revalidate: 60 * 30, // 30 minutes (mais invalidable instantanément)
    tags: [SITE_SETTINGS_TAG],
  }
)

async function getSetting(key: string) {
  return await getSettingCached(key)
}

export async function getSiteImage(key: string): Promise<SiteImage | null> {
  const setting = await getSetting(key)
  if (!setting) return null

  const value = setting.value as unknown as Partial<SiteImage>
  const src = typeof value.src === "string" ? value.src.trim() : ""
  if (!src) return null
  const alt = typeof value.alt === "string" && value.alt.trim() ? value.alt.trim() : "Photo"
  return { src, alt }
}

export async function getProjectsCarouselSettings(): Promise<ProjectsCarouselSettings | null> {
  const setting = await getSetting(SITE_KEYS.homeProjects)
  if (!setting) return null

  const value = setting.value as unknown as Partial<ProjectsCarouselSettings>
  const intervalMs = typeof value.intervalMs === "number" ? value.intervalMs : 5000
  const slides = Array.isArray(value.slides) ? (value.slides as unknown[]) : []

  const normalizedSlides = slides
    .filter((s: unknown): s is { src: unknown; alt?: unknown } => {
      if (!s || typeof s !== "object") return false
      const src = (s as { src?: unknown }).src
      return typeof src === "string" && src.trim().length > 0
    })
    .map((s) => ({
      src: String(s.src),
      alt: typeof s.alt === "string" && s.alt.trim() ? s.alt.trim() : "Photo",
    }))

  return { intervalMs, slides: normalizedSlides }
}

export type ConstructionBannerSettings = {
  isVisible: boolean
  text: string
}

export async function getConstructionBannerSettings(): Promise<ConstructionBannerSettings | null> {
  const setting = await getSetting(SITE_KEYS.constructionBanner)
  if (!setting) return null

  const value = setting.value as unknown as Partial<ConstructionBannerSettings>
  const isVisible = Boolean(value.isVisible)
  const text = typeof value.text === "string" ? value.text.trim() : ""
  return { isVisible, text }
}

export type PromoModalSettings = {
  isVisible: boolean
  title: string
  text: string
  image?: SiteImage | null
}

export async function getPromoModalSettings(): Promise<PromoModalSettings | null> {
  const setting = await getSetting(SITE_KEYS.promoModal)
  if (!setting) return null

  const value = setting.value as unknown as Partial<PromoModalSettings>
  const isVisible = Boolean(value.isVisible)
  const title = typeof value.title === "string" ? value.title.trim() : ""
  const text = typeof value.text === "string" ? value.text.trim() : ""
  const imageValue = (value as { image?: unknown }).image
  const image =
    imageValue &&
    typeof imageValue === "object" &&
    typeof (imageValue as { src?: unknown }).src === "string" &&
    ((imageValue as { src: string }).src).trim()
      ? {
          src: ((imageValue as { src: string }).src).trim(),
          alt:
            typeof (imageValue as { alt?: unknown }).alt === "string" &&
            ((imageValue as { alt: string }).alt).trim()
              ? ((imageValue as { alt: string }).alt).trim()
              : "Photo",
        }
      : null

  return { isVisible, title, text, image }
}

export type HomeTexts = {
  heroTitle: string
  heroSubtitle: string
  familyTitle: string
  familyP1: string
  familyP2: string
}

export async function getHomeTexts(): Promise<HomeTexts | null> {
  const setting = await getSetting(SITE_KEYS.homeTexts)
  if (!setting) return null
  const value = setting.value as unknown as Partial<HomeTexts>
  return {
    heroTitle: typeof value.heroTitle === "string" ? value.heroTitle : "",
    heroSubtitle: typeof value.heroSubtitle === "string" ? value.heroSubtitle : "",
    familyTitle: typeof value.familyTitle === "string" ? value.familyTitle : "",
    familyP1: typeof value.familyP1 === "string" ? value.familyP1 : "",
    familyP2: typeof value.familyP2 === "string" ? value.familyP2 : "",
  }
}

export type AboutTexts = {
  pageTitle: string
  historyTitle: string
  historyText: string
  missionTitle: string
  missionText: string
  locationTitle: string
  locationText: string
  conclusionText: string
}

export async function getAboutTexts(): Promise<AboutTexts | null> {
  const setting = await getSetting(SITE_KEYS.aboutTexts)
  if (!setting) return null
  const value = setting.value as unknown as Partial<AboutTexts>
  return {
    pageTitle: typeof value.pageTitle === "string" ? value.pageTitle : "",
    historyTitle: typeof value.historyTitle === "string" ? value.historyTitle : "",
    historyText: typeof value.historyText === "string" ? value.historyText : "",
    missionTitle: typeof value.missionTitle === "string" ? value.missionTitle : "",
    missionText: typeof value.missionText === "string" ? value.missionText : "",
    locationTitle: typeof value.locationTitle === "string" ? value.locationTitle : "",
    locationText: typeof value.locationText === "string" ? value.locationText : "",
    conclusionText: typeof value.conclusionText === "string" ? value.conclusionText : "",
  }
}

// --- Defaults + backfill (utilisé côté admin uniquement) ---

export const DEFAULT_HOME_TEXTS: HomeTexts = {
  heroTitle: "Reyssac Bois",
  heroSubtitle: "Votre expert en bois depuis 1850",
  familyTitle: "Une histoire de famille",
  familyP1:
    "Implantée à Boé et Bon-Encontre, proche d'Agen, l'entreprise Reyssac Bois a vu le jour en 1850. Depuis, notre passion et notre expertise du bois se sont transmises de père en fils sur cinq générations.",
  familyP2:
    "Nos équipes sont prêtes à accueillir aussi bien les professionnels que les particuliers. Avec un stock important à disposition, nous nous efforçons de répondre à chaque demande avec précision.",
}

export const DEFAULT_ABOUT_TEXTS: AboutTexts = {
  pageTitle: "Qui sommes-nous ?",
  historyTitle: "Notre Histoire",
  historyText:
    "L'histoire débute il y a plus de 170 ans. Jean Reyssac, l'arrière-arrière grand-père de Benoît, l'actuel gérant, crée la société Reyssac Bois en 1850. Maraicher à l'époque, il commercialise désormais les bois du Nord et de Pays. La propriété étendue jusqu'au canal, permettait la livraison des bois par péniche en provenance de Bordeaux.",
  missionTitle: "Notre Mission",
  missionText:
    "Notre mission est principalement la satisfaction du client et sa fidélisation. Nous favorisons des produits d'origine française et certifiés PEFC. Du professionnel au particulier, de la baguette à la palette, nous oeuvrons à trouver la bonne solution à chacun de nos clients.",
  locationTitle: "Notre Localisation & Projets Futurs",
  locationText:
    "Notre connaissance du bois transmise de générations en générations nous permet de conseiller, guider et accompagner chaque personne dans ses projets. Notre localisation est une force, aux portes d'Agen et à mi-chemin entre Bordeaux et Toulouse, nous sommes au coeur du Sud-Ouest. Aujourd'hui, nous sommes fiers d'être indépendants et sommes excités pour nos futurs projets, notamment la rénovation de nos bâtiments historiques.",
  conclusionText:
    "173 années d'existence font de l'entreprise familiale le plus vieux commerce d'Agen. Hâte de vous recevoir dans nos locaux !",
}

async function ensureSettingValue<T extends object>(key: string, defaultValue: T): Promise<T> {
  const existing = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  })
  if (existing) return existing.value as unknown as T

  try {
    await prisma.siteSetting.create({
      data: { key, value: defaultValue as unknown as Prisma.InputJsonValue },
    })
  } catch {
    // possible race (unique key) -> ignore
  }

  const after = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  })
  return (after?.value as unknown as T) ?? defaultValue
}

export async function ensureHomeTexts(): Promise<HomeTexts> {
  const value = await ensureSettingValue<HomeTexts>(SITE_KEYS.homeTexts, DEFAULT_HOME_TEXTS)
  return {
    heroTitle: typeof value.heroTitle === "string" ? value.heroTitle : DEFAULT_HOME_TEXTS.heroTitle,
    heroSubtitle: typeof value.heroSubtitle === "string" ? value.heroSubtitle : DEFAULT_HOME_TEXTS.heroSubtitle,
    familyTitle: typeof value.familyTitle === "string" ? value.familyTitle : DEFAULT_HOME_TEXTS.familyTitle,
    familyP1: typeof value.familyP1 === "string" ? value.familyP1 : DEFAULT_HOME_TEXTS.familyP1,
    familyP2: typeof value.familyP2 === "string" ? value.familyP2 : DEFAULT_HOME_TEXTS.familyP2,
  }
}

export async function ensureAboutTexts(): Promise<AboutTexts> {
  const value = await ensureSettingValue<AboutTexts>(SITE_KEYS.aboutTexts, DEFAULT_ABOUT_TEXTS)
  return {
    pageTitle: typeof value.pageTitle === "string" ? value.pageTitle : DEFAULT_ABOUT_TEXTS.pageTitle,
    historyTitle: typeof value.historyTitle === "string" ? value.historyTitle : DEFAULT_ABOUT_TEXTS.historyTitle,
    historyText: typeof value.historyText === "string" ? value.historyText : DEFAULT_ABOUT_TEXTS.historyText,
    missionTitle: typeof value.missionTitle === "string" ? value.missionTitle : DEFAULT_ABOUT_TEXTS.missionTitle,
    missionText: typeof value.missionText === "string" ? value.missionText : DEFAULT_ABOUT_TEXTS.missionText,
    locationTitle: typeof value.locationTitle === "string" ? value.locationTitle : DEFAULT_ABOUT_TEXTS.locationTitle,
    locationText: typeof value.locationText === "string" ? value.locationText : DEFAULT_ABOUT_TEXTS.locationText,
    conclusionText: typeof value.conclusionText === "string" ? value.conclusionText : DEFAULT_ABOUT_TEXTS.conclusionText,
  }
}
