"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/admin/components/ImageUploadField";
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar";
import AdminTabs from "@/admin/components/AdminTabs";
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
  const [state, formAction] = useActionState(updateHomeHeaderAction, null);

  const router = useRouter();
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [router, state?.ok]);

  const initialFontKey: SiteFontKey = isSiteFontKey(siteFont?.key)
    ? (siteFont.key as SiteFontKey)
    : DEFAULT_SITE_FONT_KEY;
  const [fontPreviewKey, setFontPreviewKey] =
    useState<SiteFontKey>(initialFontKey);

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
              ? "border-green-200 bg-forest-050 text-forest-800"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <AdminTabs
        tabs={[
          {
            id: "identite",
            label: "Identité visuelle",
            content: (
      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <h3 className="text-sm font-semibold text-ink">
          Identité visuelle — Police du site
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Police
            </span>
            <select
              name="siteFontKey"
              value={fontPreviewKey}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
              onChange={(e) => {
                const v = e.currentTarget.value;
                setFontPreviewKey(isSiteFontKey(v) ? v : DEFAULT_SITE_FONT_KEY);
              }}
            >
              {SITE_FONTS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-xl border border-line bg-[rgba(246,241,231,0.55)] p-4">
            <p className="text-xs text-ink-400">Aperçu</p>
            <div
              className="mt-2 rounded-lg border border-line bg-white p-4"
              style={{ fontFamily: getFontFamilyStackForKey(fontPreviewKey) }}
            >
              <p className="text-sm font-semibold text-ink">
                Reyssac Bois
              </p>
              <p className="mt-1 text-sm text-ink-600">
                Bois de construction, menuiserie et quincaillerie. (Aperçu)
              </p>
            </div>
          </div>
        </div>
      </section>
            ),
          },
          {
            id: "hero",
            label: "Hero — photo & titres",
            content: (
      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <h3 className="text-sm font-semibold text-ink">
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
            <span className="mb-1 block text-sm font-medium text-ink">
              Texte alternatif
            </span>
            <input
              name="heroAlt"
              defaultValue={hero.alt}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
              placeholder="Atelier Reyssac Bois"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Titre
            </span>
            <input
              name="homeHeroTitle"
              defaultValue={homeTexts.heroTitle}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Sous-titre
            </span>
            <input
              name="homeHeroSubtitle"
              defaultValue={homeTexts.heroSubtitle}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            />
          </label>
        </div>
      </section>
            ),
          },
          {
            id: "badge",
            label: "Badge & mini-blocs",
            content: (
      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <h3 className="text-sm font-semibold text-ink">
          Home — Hero (badge + mini-blocs)
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Badge visible
            </span>
            <select
              name="homeHeroBadgeVisible"
              defaultValue={homeTexts.heroBadgeVisible ?? true ? "1" : "0"}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            >
              <option value="0">Caché</option>
              <option value="1">Visible</option>
            </select>
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-ink">
              Texte du badge
            </span>
            <input
              name="homeHeroBadgeText"
              defaultValue={homeTexts.heroBadgeText ?? ""}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
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
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <p className="text-xs font-semibold text-ink-600">
                  Mini-section {idx}
                </p>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-ink">
                      Visible
                    </span>
                    <select
                      name={`homeHeroHighlightVisible_${idx}`}
                      defaultValue={it.isVisible ? "1" : "0"}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
                    >
                      <option value="0">Cachée</option>
                      <option value="1">Visible</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-ink">
                      Titre
                    </span>
                    <input
                      name={`homeHeroHighlightTitle_${idx}`}
                      defaultValue={it.title}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
                    />
                  </label>
                  <label className="block lg:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-ink">
                      Description
                    </span>
                    <input
                      name={`homeHeroHighlightDesc_${idx}`}
                      defaultValue={it.desc}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>
            ),
          },
        ]}
      />

      <AdminStickySaveBar hint="Modifie, puis enregistre (la page confirme quand c’est OK)." />
    </form>
  );
}
