import { prisma } from "@/lib/prisma"
import { EDITORIAL_KEYS, getDefaultArticles, type Article } from "@/lib/editorial"

/** Lecture admin sans cache (reflète immédiatement les enregistrements). */
export async function getAdminArticles(): Promise<Article[]> {
  const row = await prisma.siteSetting.findUnique({ where: { key: EDITORIAL_KEYS.articles }, select: { value: true } })
  const items = (row?.value as unknown as { items?: Article[] } | null)?.items
  return Array.isArray(items) ? items : getDefaultArticles()
}

export async function getSettingUpdatedAt(key: string) {
  const row = await prisma.siteSetting.findUnique({ where: { key }, select: { updatedAt: true } })
  return row?.updatedAt ?? null
}
