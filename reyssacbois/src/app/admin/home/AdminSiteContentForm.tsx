"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ImageUploadField from "@/admin/components/ImageUploadField"
import ProjectsCarouselEditor from "@/admin/components/ProjectsCarouselEditor"
import { updateSiteContentAction } from "@/admin/actions/siteContent"

type SiteImage = { src: string; alt: string }

export default function AdminSiteContentForm({
  hero,
  family,
  aboutHistory,
  projects,
}: {
  hero: SiteImage
  family: SiteImage
  aboutHistory: SiteImage
  projects: { speed: "slow" | "normal" | "fast"; slides: Array<{ src: string; alt: string }> }
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateSiteContentAction, null)

  useEffect(() => {
    if (state?.ok) {
      // Recharge les données serveur (au cas où)
      router.refresh()
    }
  }, [router, state?.ok])

  return (
    <form action={formAction} className="mt-6 space-y-10">
      {state?.message && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            state.ok
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Home — Hero (1 photo)</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image hero"
            inputName="heroSrc"
            initialUrl={hero.src}
            folder="home/hero"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
            <input
              name="heroAlt"
              defaultValue={hero.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Atelier Reyssac Bois"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Home — “Une histoire de famille”</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image"
            inputName="familySrc"
            initialUrl={family.src}
            folder="home/family"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
            <input
              name="familyAlt"
              defaultValue={family.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Reyssac Bois"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Home — Nos Projets (carrousel)</h3>
        <div className="mt-4">
          <ProjectsCarouselEditor initialSpeed={projects.speed} initialSlides={projects.slides} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900">Qui sommes-nous — “Notre Histoire”</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image"
            inputName="aboutHistorySrc"
            initialUrl={aboutHistory.src}
            folder="about/history"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">Texte alternatif</span>
            <input
              name="aboutHistoryAlt"
              defaultValue={aboutHistory.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Histoire Reyssac Bois"
            />
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 z-10">
        <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-3 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-gray-600">
            Pense à cliquer <span className="font-medium">Enregistrer</span> après tes modifications.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 disabled:opacity-60"
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  )
}

