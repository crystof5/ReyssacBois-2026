"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { slugify } from "@/lib/slugify"
import { sanitizeRichTextHtml } from "@/lib/richHtml"
import {
  EDITORIAL_KEYS,
  getDefaultArticles,
  getDefaultDecoupe,
  getDefaultLivraison,
  type Article,
  type DecoupePage,
  type FaqEntry,
  type LivraisonPage,
} from "@/lib/editorial"

type ActionState = { ok?: boolean; message?: string } | null

const today = () => new Date().toISOString().slice(0, 10)
const text = (v: unknown, max = 2000) => String(v ?? "").trim().slice(0, max)

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

async function readArticles(): Promise<Article[]> {
  const row = await prisma.siteSetting.findUnique({ where: { key: EDITORIAL_KEYS.articles }, select: { value: true } })
  const value = row?.value as unknown as { items?: Article[] } | null
  return Array.isArray(value?.items) ? value.items : getDefaultArticles()
}

async function writeSetting(key: string, value: object) {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: value as unknown as Prisma.InputJsonValue },
    update: { value: value as unknown as Prisma.InputJsonValue },
  })
}

async function writeArticles(items: Article[]) {
  await writeSetting(EDITORIAL_KEYS.articles, { items })
}

function invalidate(paths: string[] = []) {
  revalidateTag("siteSettings", "default")
  revalidateTag("sitemap", "default")
  revalidatePath("/", "layout")
  for (const p of paths) revalidatePath(p)
}

function uniqueSlug(base: string, taken: Set<string>) {
  const root = slugify(base) || "guide"
  let slug = root
  let i = 2
  while (taken.has(slug)) slug = `${root}-${i++}`
  return slug
}

function parseFaq(raw: unknown): FaqEntry[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((f) => ({
      id: text((f as FaqEntry)?.id, 80) || newId("faq"),
      question: text((f as FaqEntry)?.question, 300),
      answer: text((f as FaqEntry)?.answer, 2000),
    }))
    .filter((f) => f.question && f.answer)
}

function parsePayload(formData: FormData): Record<string, unknown> {
  try {
    const parsed = JSON.parse(String(formData.get("payload") ?? "{}"))
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------------
// Guides "Conseils"
// ---------------------------------------------------------------------------

export async function saveArticleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin("/admin/conseils")
  try {
    const p = parsePayload(formData)
    const id = text(p.id, 80)
    const items = await readArticles()
    const index = items.findIndex((a) => a.id === id)
    if (index < 0) return { ok: false, message: "Guide introuvable (il a peut-être été supprimé)." }

    const title = text(p.title, 200)
    if (!title) return { ok: false, message: "Le titre est obligatoire." }

    const taken = new Set(items.filter((a) => a.id !== id).map((a) => a.slug))
    const slug = uniqueSlug(text(p.slug, 120) || title, taken)

    const sections = (Array.isArray(p.sections) ? p.sections : [])
      .map((s) => {
        const sid = text((s as { id?: string })?.id, 80) || newId("section")
        return {
          id: sid,
          heading: text((s as { heading?: string })?.heading, 200),
          html: sanitizeRichTextHtml(String(formData.get(`sectionHtml_${sid}`) ?? "")),
        }
      })
      .filter((s) => s.heading || s.html)

    const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(text(p.publishedAt, 10)) ? text(p.publishedAt, 10) : today()

    const next: Article = {
      id,
      slug,
      isVisible: Boolean(p.isVisible),
      title,
      metaTitle: text(p.metaTitle, 120) || title,
      description: text(p.description, 300),
      excerpt: text(p.excerpt, 300),
      intro: text(p.intro, 3000),
      publishedAt,
      updatedAt: today(),
      sections,
      faq: parseFaq(p.faq),
      related: (Array.isArray(p.related) ? p.related : []).map((r) => text(r, 200)).filter(Boolean),
    }

    const previousSlug = items[index].slug
    items[index] = next
    await writeArticles(items)
    invalidate(["/conseils", `/conseils/${slug}`, `/conseils/${previousSlug}`, "/admin/conseils"])

    const renamed = previousSlug !== slug ? ` Nouvelle adresse : /conseils/${slug}` : ""
    return { ok: true, message: `Guide enregistré${next.isVisible ? " et publié" : " (brouillon, non visible sur le site)"}.${renamed}` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur lors de l'enregistrement." }
  }
}

export async function createArticleAction() {
  await requireAdmin("/admin/conseils")
  const items = await readArticles()
  const id = newId("article")
  const slug = uniqueSlug("nouveau guide", new Set(items.map((a) => a.slug)))
  items.unshift({
    id,
    slug,
    isVisible: false,
    title: "Nouveau guide",
    metaTitle: "",
    description: "",
    excerpt: "",
    intro: "",
    publishedAt: today(),
    updatedAt: today(),
    sections: [{ id: newId("section"), heading: "Première partie", html: "" }],
    faq: [],
    related: [],
  })
  await writeArticles(items)
  invalidate(["/admin/conseils"])
  redirect(`/admin/conseils/${id}`)
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin("/admin/conseils")
  const id = text(formData.get("id"), 80)
  const items = await readArticles()
  const removed = items.find((a) => a.id === id)
  await writeArticles(items.filter((a) => a.id !== id))
  invalidate(["/conseils", "/admin/conseils", ...(removed ? [`/conseils/${removed.slug}`] : [])])
  redirect("/admin/conseils")
}

export async function moveArticleAction(formData: FormData) {
  await requireAdmin("/admin/conseils")
  const id = text(formData.get("id"), 80)
  const dir = formData.get("dir") === "up" ? -1 : 1
  const items = await readArticles()
  const i = items.findIndex((a) => a.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= items.length) return
  ;[items[i], items[j]] = [items[j], items[i]]
  await writeArticles(items)
  invalidate(["/conseils", "/admin/conseils"])
}

export async function toggleArticleAction(formData: FormData) {
  await requireAdmin("/admin/conseils")
  const id = text(formData.get("id"), 80)
  const items = await readArticles()
  const article = items.find((a) => a.id === id)
  if (!article) return
  article.isVisible = !article.isVisible
  await writeArticles(items)
  invalidate(["/conseils", `/conseils/${article.slug}`, "/admin/conseils"])
}

// ---------------------------------------------------------------------------
// Pages de service
// ---------------------------------------------------------------------------

export async function saveServicePageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const page = formData.get("page") === "decoupe" ? "decoupe" : "livraison"
  await requireAdmin(`/admin/pages/${page}`)
  try {
    const p = parsePayload(formData)
    const common = {
      metaTitle: text(p.metaTitle, 120),
      description: text(p.description, 300),
      title: text(p.title, 200),
      introHtml: sanitizeRichTextHtml(String(formData.get("introHtml") ?? "")),
      faq: parseFaq(p.faq),
      bandHeading: text(p.bandHeading, 200),
      bandText: text(p.bandText, 2000),
    }
    if (!common.title) return { ok: false, message: "Le titre de la page est obligatoire." }

    if (page === "livraison") {
      const defaults = getDefaultLivraison()
      const value: LivraisonPage = {
        ...common,
        metaTitle: common.metaTitle || defaults.metaTitle,
        description: common.description || defaults.description,
        zones: (Array.isArray(p.zones) ? p.zones : [])
          .map((z) => ({
            id: text((z as { id?: string })?.id, 80) || newId("zone"),
            badge: text((z as { badge?: string })?.badge, 60),
            title: text((z as { title?: string })?.title, 120),
            text: text((z as { text?: string })?.text, 600),
            places: (Array.isArray((z as { places?: unknown[] })?.places) ? (z as { places: unknown[] }).places : [])
              .map((pl) => text(pl, 80))
              .filter(Boolean),
          }))
          .filter((z) => z.title),
        steps: (Array.isArray(p.steps) ? p.steps : [])
          .map((st) => ({
            id: text((st as { id?: string })?.id, 80) || newId("step"),
            title: text((st as { title?: string })?.title, 120),
            text: text((st as { text?: string })?.text, 600),
          }))
          .filter((st) => st.title),
      }
      await writeSetting(EDITORIAL_KEYS.livraison, value)
      invalidate(["/livraison-bois", "/admin/pages/livraison"])
    } else {
      const defaults = getDefaultDecoupe()
      const value: DecoupePage = {
        ...common,
        metaTitle: common.metaTitle || defaults.metaTitle,
        description: common.description || defaults.description,
        orderInfos: (Array.isArray(p.orderInfos) ? p.orderInfos : []).map((i) => text(i, 300)).filter(Boolean),
        otherWorksHtml: sanitizeRichTextHtml(String(formData.get("otherWorksHtml") ?? "")),
      }
      await writeSetting(EDITORIAL_KEYS.decoupe, value)
      invalidate(["/decoupe-panneaux-sur-mesure", "/admin/pages/decoupe"])
    }
    return { ok: true, message: "Page enregistrée et mise en ligne." }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur lors de l'enregistrement." }
  }
}

export async function resetServicePageAction(formData: FormData) {
  const page = formData.get("page") === "decoupe" ? "decoupe" : "livraison"
  await requireAdmin(`/admin/pages/${page}`)
  await prisma.siteSetting.deleteMany({ where: { key: page === "decoupe" ? EDITORIAL_KEYS.decoupe : EDITORIAL_KEYS.livraison } })
  invalidate([page === "decoupe" ? "/decoupe-panneaux-sur-mesure" : "/livraison-bois", `/admin/pages/${page}`])
  redirect(`/admin/pages/${page}?reset=1`)
}
