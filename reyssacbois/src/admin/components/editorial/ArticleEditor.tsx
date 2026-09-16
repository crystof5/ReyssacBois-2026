"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import RichTextEditor from "@/admin/components/RichTextEditor"
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar"
import { saveArticleAction } from "@/admin/actions/editorial"
import { slugify } from "@/lib/slugify"
import {
  AddButton,
  CharCounter,
  FaqListEditor,
  Field,
  GooglePreview,
  ItemCard,
  Panel,
  Toggle,
  inputClass,
  moveItem,
  newClientId,
  type FaqDraft,
} from "@/admin/components/editorial/ui"

export type ArticleDraft = {
  id: string
  slug: string
  isVisible: boolean
  title: string
  metaTitle: string
  description: string
  excerpt: string
  intro: string
  publishedAt: string
  sections: { id: string; heading: string; html: string }[]
  faq: FaqDraft[]
  related: string[]
}

export type CategoryOption = { slug: string; label: string }

export default function ArticleEditor({
  initial,
  categories,
}: {
  initial: ArticleDraft
  categories: CategoryOption[]
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveArticleAction, null)
  useEffect(() => {
    if (state?.ok) router.refresh()
  }, [router, state])

  const [a, setA] = useState(initial)
  const [slugTouched, setSlugTouched] = useState(initial.slug !== slugify(initial.title))
  const [catQuery, setCatQuery] = useState("")
  const set = <K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) => setA((prev) => ({ ...prev, [key]: value }))

  const filteredCats = useMemo(() => {
    const q = slugify(catQuery)
    return q ? categories.filter((c) => slugify(c.label).includes(q)) : categories
  }, [catQuery, categories])

  // Le HTML des sections est porté par les éditeurs riches (champs cachés sectionHtml_<id>).
  const payload = JSON.stringify({
    ...a,
    sections: a.sections.map(({ id, heading }) => ({ id, heading })),
  })

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="payload" value={payload} />

      {state?.message ? (
        <div
          className={`mb-4 rounded border p-3 text-sm font-medium ${
            state.ok ? "border-forest-700/30 bg-forest-050 text-forest-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.ok ? "✓ " : "⚠ "}
          {state.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Colonne principale */}
        <div className="min-w-0 space-y-6">
          <Panel icon="📝" title="L'essentiel" subtitle="Ce que le lecteur voit en premier.">
            <div className="space-y-4">
              <Field label="Titre du guide" counter={<CharCounter value={a.title} min={30} max={70} />}>
                <input
                  className={`${inputClass} text-base font-semibold`}
                  value={a.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setA((prev) => ({ ...prev, title, slug: slugTouched ? prev.slug : slugify(title) }))
                  }}
                  placeholder="Ex. : Quel bois choisir pour une terrasse ?"
                />
              </Field>
              <Field
                label="Résumé (carte de la page Conseils)"
                counter={<CharCounter value={a.excerpt} min={60} max={160} />}
              >
                <textarea
                  className={`${inputClass} min-h-16`}
                  value={a.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="Une ou deux phrases qui donnent envie de lire."
                />
              </Field>
              <Field label="Introduction" hint="Affichée sous le titre, en haut du guide.">
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={a.intro}
                  onChange={(e) => set("intro", e.target.value)}
                />
              </Field>
            </div>
          </Panel>

          <Panel
            icon="📚"
            title={`Contenu du guide (${a.sections.length} partie${a.sections.length > 1 ? "s" : ""})`}
            subtitle="Chaque partie a un intertitre et un texte mis en forme. Utilisez ↑ ↓ pour réorganiser."
          >
            <div className="space-y-3">
              {a.sections.map((section, i) => (
                <ItemCard
                  key={section.id}
                  index={i}
                  total={a.sections.length}
                  label="Partie"
                  onMove={(dir) => set("sections", moveItem(a.sections, i, dir))}
                  onRemove={() => set("sections", a.sections.filter((s) => s.id !== section.id))}
                >
                  <input
                    className={`${inputClass} font-semibold`}
                    placeholder="Intertitre de la partie"
                    value={section.heading}
                    onChange={(e) =>
                      set(
                        "sections",
                        a.sections.map((s) => (s.id === section.id ? { ...s, heading: e.target.value } : s)),
                      )
                    }
                  />
                  <RichTextEditor
                    inputName={`sectionHtml_${section.id}`}
                    initialHtml={section.html}
                    placeholder="Rédigez le texte de cette partie…"
                  />
                </ItemCard>
              ))}
              <AddButton
                label="Ajouter une partie"
                onClick={() => set("sections", [...a.sections, { id: newClientId("section"), heading: "", html: "" }])}
              />
            </div>
          </Panel>

          <Panel icon="❓" title={`Questions fréquentes (${a.faq.length})`} subtitle="Affichées en bas du guide et comprises par Google.">
            <FaqListEditor items={a.faq} onChange={(faq) => set("faq", faq)} />
          </Panel>
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Panel icon="🚀" title="Publication">
            <div className="space-y-4">
              <Toggle
                checked={a.isVisible}
                onChange={(v) => set("isVisible", v)}
                onLabel="Publié sur le site"
                offLabel="Brouillon (invisible)"
              />
              <Field label="Date de publication">
                <input
                  type="date"
                  className={inputClass}
                  value={a.publishedAt}
                  onChange={(e) => set("publishedAt", e.target.value)}
                />
              </Field>
              <Field label="Adresse de la page" hint="Générée depuis le titre. Évitez de la changer une fois publiée.">
                <div className="flex items-stretch">
                  <span className="flex items-center rounded-l border border-r-0 border-line bg-surface-2 px-2 text-xs text-ink-400">
                    /conseils/
                  </span>
                  <input
                    className={`${inputClass} rounded-l-none`}
                    value={a.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      set("slug", slugify(e.target.value))
                    }}
                  />
                </div>
              </Field>
            </div>
          </Panel>

          <Panel icon="🔎" title="Référencement Google">
            <div className="space-y-4">
              <GooglePreview title={a.metaTitle || a.title} description={a.description} path={`/conseils/${a.slug}`} />
              <Field label="Titre Google" counter={<CharCounter value={a.metaTitle || a.title} min={30} max={60} />}>
                <input
                  className={inputClass}
                  value={a.metaTitle}
                  placeholder={a.title}
                  onChange={(e) => set("metaTitle", e.target.value)}
                />
              </Field>
              <Field label="Description Google" counter={<CharCounter value={a.description} min={110} max={160} />}>
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={a.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Idéalement 120 à 160 caractères, avec « Agen »."
                />
              </Field>
            </div>
          </Panel>

          <Panel
            icon="🪵"
            title={`Catégories liées (${a.related.length})`}
            subtitle="Le guide s'affiche sur ces catégories et renvoie vers elles."
          >
            <input
              className={`${inputClass} mb-2`}
              placeholder="Filtrer les catégories…"
              value={catQuery}
              onChange={(e) => setCatQuery(e.target.value)}
            />
            <div className="max-h-72 space-y-0.5 overflow-y-auto pr-1">
              {filteredCats.map((c) => {
                const checked = a.related.includes(c.slug)
                return (
                  <label
                    key={c.slug}
                    className={`flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 text-sm ${
                      checked ? "bg-forest-050 text-forest-800" : "text-ink hover:bg-surface-2"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-[var(--forest-700)]"
                      checked={checked}
                      onChange={() =>
                        set("related", checked ? a.related.filter((s) => s !== c.slug) : [...a.related, c.slug])
                      }
                    />
                    <span>{c.label}</span>
                  </label>
                )
              })}
            </div>
          </Panel>
        </aside>
      </div>

      <div className="mt-6">
        <AdminStickySaveBar
          hint={a.isVisible ? "Enregistrer met le guide à jour sur le site." : "Brouillon : enregistré mais invisible sur le site."}
          secondaryHref={a.isVisible ? `/conseils/${initial.slug}` : undefined}
          secondaryLabel={a.isVisible ? "Voir sur le site" : undefined}
        />
      </div>
    </form>
  )
}
