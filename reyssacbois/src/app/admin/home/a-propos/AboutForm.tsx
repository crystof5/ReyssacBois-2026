"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/admin/components/ImageUploadField";
import RichTextEditor from "@/admin/components/RichTextEditor";
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar";
import { updateAboutTextsAction } from "@/admin/actions/siteContentSections";

export default function AboutForm({
  aboutHistory,
  aboutTexts,
  version,
}: {
  aboutHistory: { src: string; alt: string };
  aboutTexts: {
    pageTitle: string;
    historyTitle: string;
    historyText: string;
    missionTitle: string;
    missionText: string;
    locationTitle: string;
    locationText: string;
    conclusionText: string;
    historyTextHtml?: string;
    missionTextHtml?: string;
    locationTextHtml?: string;
    conclusionTextHtml?: string;
  };
  version: string;
}) {
  const [state, formAction] = useActionState(updateAboutTextsAction, null);

  const router = useRouter();
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [router, state?.ok]);

  return (
    <form key={version} action={formAction} className="mt-6 space-y-6">
      {state?.message ? (
        <div
          className={`rounded-xl border p-3 text-sm ${
            state.ok
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Qui sommes-nous — Image “Notre Histoire”
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image"
            inputName="aboutHistorySrc"
            initialUrl={aboutHistory.src}
            folder="about/history"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte alternatif
            </span>
            <input
              name="aboutHistoryAlt"
              defaultValue={aboutHistory.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Qui sommes-nous — Textes
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Titre de page
            </span>
            <input
              name="aboutPageTitle"
              defaultValue={aboutTexts.pageTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Titre “Notre Histoire”
            </span>
            <input
              name="aboutHistoryTitle"
              defaultValue={aboutTexts.historyTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte “Notre Histoire”
            </span>
          </label>
          <RichTextEditor
            inputName="aboutHistoryTextHtml"
            initialHtml={
              aboutTexts.historyTextHtml ?? aboutTexts.historyText ?? ""
            }
            placeholder="Texte…"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-900">
                Titre “Notre Mission”
              </span>
              <input
                name="aboutMissionTitle"
                defaultValue={aboutTexts.missionTitle}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-900">
                Titre “Localisation & Projets Futurs”
              </span>
              <input
                name="aboutLocationTitle"
                defaultValue={aboutTexts.locationTitle}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte “Notre Mission”
            </span>
          </label>
          <RichTextEditor
            inputName="aboutMissionTextHtml"
            initialHtml={
              aboutTexts.missionTextHtml ?? aboutTexts.missionText ?? ""
            }
            placeholder="Texte…"
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte “Localisation & Projets Futurs”
            </span>
          </label>
          <RichTextEditor
            inputName="aboutLocationTextHtml"
            initialHtml={
              aboutTexts.locationTextHtml ?? aboutTexts.locationText ?? ""
            }
            placeholder="Texte…"
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte de conclusion
            </span>
          </label>
          <RichTextEditor
            inputName="aboutConclusionTextHtml"
            initialHtml={
              aboutTexts.conclusionTextHtml ?? aboutTexts.conclusionText ?? ""
            }
            placeholder="Texte…"
          />
        </div>
      </section>

      <AdminStickySaveBar hint="Modifie, puis enregistre (la page confirme quand c’est OK)." />
    </form>
  );
}
