import { prisma } from "@/lib/prisma"

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
} as const

async function getSetting(key: string) {
  return await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  })
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
  const slides = Array.isArray(value.slides) ? value.slides : []

  const normalizedSlides = slides
    .filter((s: any) => s && typeof s.src === "string" && s.src.trim())
    .map((s: any) => ({
      src: String(s.src),
      alt: typeof s.alt === "string" && s.alt.trim() ? s.alt.trim() : "Photo",
    }))

  return { intervalMs, slides: normalizedSlides }
}
