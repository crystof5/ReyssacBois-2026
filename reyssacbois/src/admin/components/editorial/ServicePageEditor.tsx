"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import RichTextEditor from "@/admin/components/RichTextEditor"
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar"
import { saveServicePageAction } from "@/admin/actions/editorial"
import {
  AddButton,
  CharCounter,
  FaqListEditor,
  Field,
  GooglePreview,
  ItemCard,
  Panel,
  inputClass,
  moveItem,
  newClientId,
  type FaqDraft,
} from "@/admin/components/editorial/ui"

type Zone = { id: string; badge: string; title: string; text: string; places: string[] }
type Step = { id: string; title: string; text: string }

export type ServicePageDraft = {
  metaTitle: string
  description: string
  title: string
  introHtml: string
  faq: FaqDraft[]
  bandHeading: string
  bandText: string
  // Livraison
  zones?: Zone[]
  steps?: Step[]
  // Découpe
  orderInfos?: string[]
  otherWorksHtml?: string
}

export default function ServicePageEditor({
  page,
  path,
  initial,
}: {
  page: "livraison" | "decoupe"
  path: string
  initial: ServicePageDraft
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveServicePageAction, null)
  useEffect(() => {
    if (state?.ok) router.refresh()
  }, [router, state])

  const [d, setD] = useState(initial)
  const set = <K extends keyof ServicePageDraft>(key: K, value: ServicePageDraft[K]) =>
    setD((prev) => ({ ...prev, [key]: value }))

  const zones = d.zones ?? []
  const steps = d.steps ?? []
  const orderInfos = d.orderInfos ?? []
  const updateZone = (id: string, patch: Partial<Zone>) =>
    set("zones", zones.map((z) => (z.id === id ? { ...z, ...patch } : z)))
  const updateStep = (id: string, patch: Partial<Step>) =>
    set("steps", steps.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  const payload = JSON.stringify({ ...d, introHtml: undefined, otherWorksHtml: undefined })

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="page" value={page} />
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
        <div className="min-w-0 space-y-6">
          <Panel icon="🏷️" title="En-tête de la page">
            <div className="space-y-4">
              <Field label="Titre affiché" counter={<CharCounter value={d.title} min={20} max={70} />}>
                <input className={`${inputClass} text-base font-semibold`} value={d.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <div>
                <span className="text-sm font-semibold text-ink">Introduction</span>
                <div className="mt-1.5">
                  <RichTextEditor inputName="introHtml" initialHtml={d.introHtml} />
                </div>
              </div>
            </div>
          </Panel>

          {page === "livraison" ? (
            <>
              <Panel icon="🗺️" title={`Zones de livraison (${zones.length})`} subtitle="Une carte par zone. Les villes s'affichent en pastilles.">
                <div className="space-y-3">
                  {zones.map((zone, i) => (
                    <ItemCard
                      key={zone.id}
                      index={i}
                      total={zones.length}
                      label="Zone"
                      onMove={(dir) => set("zones", moveItem(zones, i, dir))}
                      onRemove={() => set("zones", zones.filter((z) => z.id !== zone.id))}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr]">
                        <input className={inputClass} placeholder="Étiquette (ex. Sur devis)" value={zone.badge} onChange={(e) => updateZone(zone.id, { badge: e.target.value })} />
                        <input className={`${inputClass} font-semibold`} placeholder="Nom de la zone" value={zone.title} onChange={(e) => updateZone(zone.id, { title: e.target.value })} />
                      </div>
                      <textarea className={`${inputClass} min-h-16`} placeholder="Texte de présentation" value={zone.text} onChange={(e) => updateZone(zone.id, { text: e.target.value })} />
                      <Field label="Villes" hint="Une ville par ligne ou séparées par des virgules.">
                        <textarea
                          className={`${inputClass} min-h-20`}
                          defaultValue={zone.places.join(", ")}
                          onChange={(e) =>
                            updateZone(zone.id, {
                              places: e.target.value.split(/[,\n]/).map((p) => p.trim()).filter(Boolean),
                            })
                          }
                        />
                      </Field>
                      {zone.places.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {zone.places.map((p) => (
                            <span key={p} className="rounded-full border border-line bg-surface px-2 py-0.5 text-xs text-ink-600">
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </ItemCard>
                  ))}
                  <AddButton
                    label="Ajouter une zone"
                    onClick={() => set("zones", [...zones, { id: newClientId("zone"), badge: "", title: "", text: "", places: [] }])}
                  />
                </div>
              </Panel>

              <Panel icon="🚚" title={`Étapes de la livraison (${steps.length})`} subtitle="Numérotées automatiquement sur le site.">
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <ItemCard
                      key={step.id}
                      index={i}
                      total={steps.length}
                      label="Étape"
                      onMove={(dir) => set("steps", moveItem(steps, i, dir))}
                      onRemove={() => set("steps", steps.filter((s) => s.id !== step.id))}
                    >
                      <input className={`${inputClass} font-semibold`} placeholder="Titre de l'étape" value={step.title} onChange={(e) => updateStep(step.id, { title: e.target.value })} />
                      <textarea className={`${inputClass} min-h-16`} placeholder="Explication" value={step.text} onChange={(e) => updateStep(step.id, { text: e.target.value })} />
                    </ItemCard>
                  ))}
                  <AddButton label="Ajouter une étape" onClick={() => set("steps", [...steps, { id: newClientId("step"), title: "", text: "" }])} />
                </div>
              </Panel>
            </>
          ) : (
            <>
              <Panel icon="📐" title="« Comment commander une découpe ? »" subtitle="La liste des informations à fournir.">
                <div className="space-y-2">
                  {orderInfos.map((info, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-700 text-xs font-bold text-white">{i + 1}</span>
                      <input
                        className={inputClass}
                        value={info}
                        onChange={(e) => set("orderInfos", orderInfos.map((x, j) => (j === i ? e.target.value : x)))}
                      />
                      <button
                        type="button"
                        aria-label="Supprimer"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-line text-red-600 hover:bg-red-50"
                        onClick={() => set("orderInfos", orderInfos.filter((_, j) => j !== i))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <AddButton label="Ajouter une ligne" onClick={() => set("orderInfos", [...orderInfos, ""])} />
                </div>
              </Panel>

              <Panel icon="🪚" title="« Autres travaux à façon »">
                <RichTextEditor inputName="otherWorksHtml" initialHtml={d.otherWorksHtml ?? ""} />
              </Panel>
            </>
          )}

          <Panel icon="❓" title={`Questions fréquentes (${d.faq.length})`} subtitle="Affichées en bas de la page et comprises par Google.">
            <FaqListEditor items={d.faq} onChange={(faq) => set("faq", faq)} />
          </Panel>

          <Panel icon="🟩" title="Bande verte en bas de page" subtitle="Le bloc « Votre négociant bois à Agen » avant le pied de page.">
            <div className="space-y-3">
              <input className={`${inputClass} font-semibold`} value={d.bandHeading} onChange={(e) => set("bandHeading", e.target.value)} placeholder="Titre" />
              <textarea
                className={`${inputClass} min-h-24`}
                value={d.bandText}
                onChange={(e) => set("bandText", e.target.value)}
                placeholder="Texte (un saut de ligne = un nouveau paragraphe)"
              />
            </div>
          </Panel>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Panel icon="🔎" title="Référencement Google">
            <div className="space-y-4">
              <GooglePreview title={d.metaTitle || d.title} description={d.description} path={path} />
              <Field label="Titre Google" counter={<CharCounter value={d.metaTitle || d.title} min={30} max={60} />}>
                <input className={inputClass} value={d.metaTitle} placeholder={d.title} onChange={(e) => set("metaTitle", e.target.value)} />
              </Field>
              <Field label="Description Google" counter={<CharCounter value={d.description} min={110} max={160} />}>
                <textarea className={`${inputClass} min-h-24`} value={d.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          </Panel>
        </aside>
      </div>

      <div className="mt-6">
        <AdminStickySaveBar hint="Enregistrer met la page à jour sur le site." secondaryHref={path} secondaryLabel="Voir sur le site" />
      </div>
    </form>
  )
}
