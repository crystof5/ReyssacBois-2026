"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
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

export async function updateSiteContentAction(formData: FormData) {
  const heroSrc = String(formData.get("heroSrc") ?? "").trim()
  const heroAlt = normalizeAlt(String(formData.get("heroAlt") ?? ""), "Atelier Reyssac Bois")

  const familySrc = String(formData.get("familySrc") ?? "").trim()
  const familyAlt = normalizeAlt(String(formData.get("familyAlt") ?? ""), "Reyssac Bois")

  const aboutHistorySrc = String(formData.get("aboutHistorySrc") ?? "").trim()
  const aboutHistoryAlt = normalizeAlt(String(formData.get("aboutHistoryAlt") ?? ""), "Histoire Reyssac Bois")

  const projectsSpeed = String(formData.get("projectsSpeed") ?? "normal")
  const projectsIntervalMs = parseInterval(projectsSpeed)

  const slidesJson = String(formData.get("projectsSlidesJson") ?? "[]")
  let slides: Array<{ src: string; alt: string }> = []
  try {
    const parsed = JSON.parse(slidesJson) as Array<any>
    if (Array.isArray(parsed)) {
      slides = parsed
        .filter((s) => s && typeof s.src === "string" && s.src.trim())
        .map((s, idx) => ({
          src: String(s.src).trim(),
          alt: normalizeAlt(typeof s.alt === "string" ? s.alt : "", `Projet ${idx + 1}`),
        }))
        .slice(0, 50) // garde-fou
    }
  } catch {
    // ignore => pas de slides
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
  ])

  revalidatePath("/")
  revalidatePath("/qui-sommes-nous")
  revalidatePath("/admin/home")
  redirect("/admin/home")
}


