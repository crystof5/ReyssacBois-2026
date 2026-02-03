"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/admin/components/ImageUploadField";
import { updateHomeHeaderAction } from "@/admin/actions/siteContentSections";
import {
  DEFAULT_SITE_FONT_KEY,
  getFontFamilyStackForKey,
  isSiteFontKey,
  SITE_FONTS,
  type SiteFontKey,
} from "@/lib/siteFonts";

export default function HautForm({
  hero,
  siteFont,
  homeTexts,
  version,
}: {
  hero: { src: string; alt: string };
  siteFont: { key: string };
  homeTexts: {
    heroTitle: string;
    heroSubtitle: string;
    heroBadgeVisible?: boolean;
    heroBadgeText?: string;
    heroHighlights?: Array<{ isVisible: boolean; title: string; desc: string }>;
  };
  version: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateHomeHeaderAction,
    null
  );

  const router = useRouter();
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [router, state?.ok]);

  const initialFontKey: SiteFontKey = isSiteFontKey(siteFont?.key)
    ? (siteFont.key as SiteFontKey)
    : DEFAULT_SITE_FONT_KEY;
  const fontKey = initialFontKey;

  const highlights = homeTexts.heroHighlights ?? [
    { isVisible: true, title: "Depuis 1850", desc: "Entreprise familiale" },
    { isVisible: true, title: "Conseil", desc: "Pro & particuliers" },
    { isVisible: true, title: "Stock", desc: "Disponibilité rapide" },
  ];

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
          Identité visuelle — Police du site
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Police
            </span>
            <select
              name="siteFontKey"
              defaultValue={fontKey}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            >
              {SITE_FONTS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-xl border border-gray-200 bg-[rgba(246,241,231,0.55)] p-4">
            <p className="text-xs text-gray-500">Aperçu</p>
            <div
              className="mt-2 rounded-lg border border-gray-200 bg-white p-4"
              style={{ fontFamily: getFontFamilyStackForKey(fontKey) }}
            >
              <p className="text-sm font-semibold text-gray-900">
                Reyssac Bois
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Bois de construction, menuiserie et quincaillerie. (Aperçu)
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Home — Hero (1 photo)
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image hero"
            inputName="heroSrc"
            initialUrl={hero.src}
            folder="home/hero"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte alternatif
            </span>
            <input
              name="heroAlt"
              defaultValue={hero.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Atelier Reyssac Bois"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Titre
            </span>
            <input
              name="homeHeroTitle"
              defaultValue={homeTexts.heroTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Sous-titre
            </span>
            <input
              name="homeHeroSubtitle"
              defaultValue={homeTexts.heroSubtitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Home — Hero (badge + mini-blocs)
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Badge visible
            </span>
            <select
              name="homeHeroBadgeVisible"
              defaultValue={homeTexts.heroBadgeVisible ?? true ? "1" : "0"}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="0">Caché</option>
              <option value="1">Visible</option>
            </select>
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte du badge
            </span>
            <input
              name="homeHeroBadgeText"
              defaultValue={homeTexts.heroBadgeText ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          {[1, 2, 3].map((idx) => {
            const it = highlights[idx - 1] ?? {
              isVisible: true,
              title: "",
              desc: "",
            };
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white/70 p-4"
              >
                <p className="text-xs font-semibold text-gray-700">
                  Mini-section {idx}
                </p>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-900">
                      Visible
                    </span>
                    <select
                      name={`homeHeroHighlightVisible_${idx}`}
                      defaultValue={it.isVisible ? "1" : "0"}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                    >
                      <option value="0">Cachée</option>
                      <option value="1">Visible</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-900">
                      Titre
                    </span>
                    <input
                      name={`homeHeroHighlightTitle_${idx}`}
                      defaultValue={it.title}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                    />
                  </label>
                  <label className="block lg:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-gray-900">
                      Description
                    </span>
                    <input
                      name={`homeHeroHighlightDesc_${idx}`}
                      defaultValue={it.desc}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-4 z-10">
        <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-3 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-gray-600">
            Tu peux retourner au{" "}
            <Link href="/admin/home" className="underline">
              menu Home
            </Link>
            .
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
  );
}
