"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { SITE_KEYS } from "@/admin/queries/siteSettings"

function parseInterval(value: string) {
  if (value === "slow") return 8000
  if (value === "fast") return 3000
  return 5000
}

function normalizeAlt(alt: string, fallback: string) {
  const a = alt.trim()
  return a || fallback
}

function normalizeText(value: FormDataEntryValue | null | undefined) {
  return String(value ?? "").trim()
}

function parseVisibleFlag(value: FormDataEntryValue | null | undefined) {
  const v = String(value ?? "").trim().toLowerCase()
  return v === "1" || v === "true" || v === "on" || v === "yes"
}

export async function updateSiteContentAction(
  _prevState: { ok?: boolean; message?: string } | null,
  formData: FormData
) {
  // (Ce fichier est utilisé via useActionState côté client, donc on retourne un état plutôt qu'un redirect.)
  try {
    const heroSrc = normalizeText(formData.get("heroSrc"))
    const heroAlt = normalizeAlt(String(formData.get("heroAlt") ?? ""), "Atelier Reyssac Bois")

    const familySrc = normalizeText(formData.get("familySrc"))
    const familyAlt = normalizeAlt(String(formData.get("familyAlt") ?? ""), "Reyssac Bois")

    const aboutHistorySrc = normalizeText(formData.get("aboutHistorySrc"))
    const aboutHistoryAlt = normalizeAlt(String(formData.get("aboutHistoryAlt") ?? ""), "Histoire Reyssac Bois")

    const projectsSpeed = String(formData.get("projectsSpeed") ?? "normal")
    const projectsIntervalMs = parseInterval(projectsSpeed)

    const slidesJson = String(formData.get("projectsSlidesJson") ?? "[]")
    let slides: Array<{ src: string; alt: string }> = []
    try {
      const parsed: unknown = JSON.parse(slidesJson)
      if (Array.isArray(parsed)) {
        slides = parsed
          .filter((s: unknown): s is { src: unknown; alt?: unknown } => {
            if (!s || typeof s !== "object") return false
            const src = (s as { src?: unknown }).src
            return typeof src === "string" && src.trim().length > 0
          })
          .map((s, idx) => ({
            src: String(s.src).trim(),
            alt: normalizeAlt(typeof s.alt === "string" ? s.alt : "", `Projet ${idx + 1}`),
          }))
          .slice(0, 50) // garde-fou
      }
    } catch {
      // ignore => pas de slides
    }

    // Textes Home / About
    const homeTexts = {
      heroTitle: normalizeText(formData.get("homeHeroTitle")),
      heroSubtitle: normalizeText(formData.get("homeHeroSubtitle")),
      familyTitle: normalizeText(formData.get("homeFamilyTitle")),
      familyP1: normalizeText(formData.get("homeFamilyP1")),
      familyP2: normalizeText(formData.get("homeFamilyP2")),
    }

    const aboutTexts = {
      pageTitle: normalizeText(formData.get("aboutPageTitle")),
      historyTitle: normalizeText(formData.get("aboutHistoryTitle")),
      historyText: normalizeText(formData.get("aboutHistoryText")),
      missionTitle: normalizeText(formData.get("aboutMissionTitle")),
      missionText: normalizeText(formData.get("aboutMissionText")),
      locationTitle: normalizeText(formData.get("aboutLocationTitle")),
      locationText: normalizeText(formData.get("aboutLocationText")),
      conclusionText: normalizeText(formData.get("aboutConclusionText")),
    }

    // Bannière "site en construction"
    const banner = {
      isVisible: parseVisibleFlag(formData.get("bannerVisible")),
      text: normalizeText(formData.get("bannerText")),
    }

    // Promo modal
    const promoImageSrc = normalizeText(formData.get("promoImageSrc"))
    const promoImageAlt = normalizeAlt(String(formData.get("promoImageAlt") ?? ""), "Photo promo")
    const promo = {
      isVisible: parseVisibleFlag(formData.get("promoVisible")),
      title: normalizeText(formData.get("promoTitle")),
      text: normalizeText(formData.get("promoText")),
      image: { src: promoImageSrc, alt: promoImageAlt },
    }

    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeHero },
        create: { key: SITE_KEYS.homeHero, value: heroSrc ? { src: heroSrc, alt: heroAlt } : { src: "", alt: heroAlt } },
        update: { value: heroSrc ? { src: heroSrc, alt: heroAlt } : { src: "", alt: heroAlt } },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeFamily },
        create: { key: SITE_KEYS.homeFamily, value: familySrc ? { src: familySrc, alt: familyAlt } : { src: "", alt: familyAlt } },
        update: { value: familySrc ? { src: familySrc, alt: familyAlt } : { src: "", alt: familyAlt } },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.aboutHistory },
        create: { key: SITE_KEYS.aboutHistory, value: aboutHistorySrc ? { src: aboutHistorySrc, alt: aboutHistoryAlt } : { src: "", alt: aboutHistoryAlt } },
        update: { value: aboutHistorySrc ? { src: aboutHistorySrc, alt: aboutHistoryAlt } : { src: "", alt: aboutHistoryAlt } },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeProjects },
        create: { key: SITE_KEYS.homeProjects, value: { intervalMs: projectsIntervalMs, slides } },
        update: { value: { intervalMs: projectsIntervalMs, slides } },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeTexts },
        create: { key: SITE_KEYS.homeTexts, value: homeTexts },
        update: { value: homeTexts },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.aboutTexts },
        create: { key: SITE_KEYS.aboutTexts, value: aboutTexts },
        update: { value: aboutTexts },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.constructionBanner },
        create: { key: SITE_KEYS.constructionBanner, value: banner },
        update: { value: banner },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.promoModal },
        create: { key: SITE_KEYS.promoModal, value: promo },
        update: { value: promo },
      }),
    ])

    revalidatePath("/", "layout")
    revalidatePath("/categories", "layout")
    revalidatePath("/produits", "layout")
    revalidatePath("/qui-sommes-nous")
    revalidatePath("/admin/home")

    return { ok: true as const, message: "Enregistré." }
  } catch (e: unknown) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    }
  }
}


