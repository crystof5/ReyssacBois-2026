"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/admin/components/ImageUploadField";
import ProjectsCarouselEditor from "@/admin/components/ProjectsCarouselEditor";
import { updateSiteContentAction } from "@/admin/actions/siteContent";
import PromoModal from "@/components/PromoModal";
import RichTextEditor from "@/admin/components/RichTextEditor";
import HomeFaqEditor from "@/admin/components/HomeFaqEditor";
import AdminFloatingSaveButton from "@/admin/components/AdminFloatingSaveButton";
import {
  DEFAULT_SITE_FONT_KEY,
  getFontFamilyStackForKey,
  isSiteFontKey,
  SITE_FONTS,
  type SiteFontKey,
} from "@/lib/siteFonts";

type SiteImage = { src: string; alt: string };
type HomeTexts = {
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeVisible?: boolean;
  heroBadgeText?: string;
  heroHighlights?: Array<{ isVisible: boolean; title: string; desc: string }>;
  familyTitle: string;
  familyP1: string;
  familyP2: string;
  familyP1Html?: string;
  familyP2Html?: string;
  catalogueTitle?: string;
  catalogueIntro?: string;
  catalogueItems?: Array<{ kind: "category" | "product"; id: string } | null>;
};
type AboutTexts = {
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

type HomeFaqItem = {
  id: string;
  isVisible: boolean;
  question: string;
  answer: string;
  answerHtml?: string;
};

type HomeFaqSettings = {
  isVisible: boolean;
  title: string;
  intro: string;
  introHtml?: string;
  items: HomeFaqItem[];
};

type ContactInfoSettings = {
  title: string;
  text: string;
  textHtml?: string;
};

type SearchCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isVisible: boolean;
  parent: { name: string; slug: string } | null;
};

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isVisible: boolean;
  section: string | null;
  length: string | null;
  width: string | null;
  type: string | null;
  categories: { category: { name: string; slug: string } }[];
};

type SearchApiResponse =
  | {
      ok: true;
      q: string;
      categories: SearchCategory[];
      products: SearchProduct[];
    }
  | { ok: false; error: string };

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function CatalogueItemPicker({
  slot,
  initial,
  preview,
}: {
  slot: 1 | 2 | 3;
  initial: { kind: "category" | "product"; id: string } | null;
  preview: {
    id: string;
    kind: "category" | "product";
    name: string;
    slug: string;
    description: string | null;
    isVisible: boolean;
  } | null;
}) {
  const [selectedKind, setSelectedKind] = useState<"" | "category" | "product">(
    initial?.kind ?? ""
  );
  const [selectedId, setSelectedId] = useState<string>(initial?.id ?? "");
  const [localSelected, setLocalSelected] = useState<{
    kind: "category" | "product";
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isVisible: boolean;
  } | null>(null);

  const [q, setQ] = useState("");
  const debounced = useDebouncedValue(q, 220);
  const trimmed = debounced.trim();
  const hasQuery = trimmed.length >= 2;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cats, setCats] = useState<SearchCategory[]>([]);
  const [prods, setProds] = useState<SearchProduct[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!hasQuery) {
      setCats([]);
      setProds([]);
      setError(null);
      setLoading(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    const controller = new AbortController();
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=8&admin=1`, {
      signal: controller.signal,
    })
      .then((r) => r.json() as Promise<SearchApiResponse>)
      .then((json) => {
        if (!json || typeof json !== "object")
          throw new Error("Réponse invalide");
        if (json.ok !== true) throw new Error("Recherche indisponible.");
        setCats(json.categories ?? []);
        setProds(json.products ?? []);
        setError(null);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setCats([]);
        setProds([]);
        setError(e instanceof Error ? e.message : "Recherche indisponible.");
      })
      .finally(() => setLoading(false));
  }, [hasQuery, trimmed]);

  const resolved =
    preview && preview.id === selectedId && preview.kind === selectedKind
      ? preview
      : localSelected &&
        localSelected.id === selectedId &&
        localSelected.kind === selectedKind
      ? localSelected
      : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4">
      <p className="text-xs font-semibold text-gray-700">Carte {slot}</p>

      <input
        type="hidden"
        name={`homeCatalogueItemKind_${slot}`}
        value={selectedKind}
      />
      <input
        type="hidden"
        name={`homeCatalogueItemId_${slot}`}
        value={selectedId}
      />

      {selectedKind && selectedId ? (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {resolved?.name || `${selectedKind} • ${selectedId}`}
              </p>
              {resolved ? (
                <p className="mt-1 text-xs text-gray-600">
                  {resolved.isVisible ? "Visible" : "Caché"} • /
                  {resolved.kind === "category" ? "categories" : "produits"}/
                  {resolved.slug}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="shrink-0 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
              onClick={() => {
                setSelectedKind("");
                setSelectedId("");
                setLocalSelected(null);
              }}
            >
              Retirer
            </button>
          </div>
          {resolved ? (
            <p className="mt-2 text-xs text-gray-700">
              {resolved.description?.trim()
                ? resolved.description
                : "Aucune description."}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-600">Aucun élément sélectionné.</p>
      )}

      <div className="mt-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-900">
            Rechercher (produit ou catégorie)
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder="Tape 2+ caractères…"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          />
        </label>

        {loading ? (
          <p className="mt-2 text-xs text-gray-500">Recherche…</p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}

        {hasQuery && !loading && !error ? (
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div>
              <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Catégories
              </p>
              <ul className="space-y-1">
                {cats.length ? (
                  cats.map((c) => (
                    <li key={`c:${c.id}`}>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => {
                          setSelectedKind("category");
                          setSelectedId(c.id);
                          setLocalSelected({
                            kind: "category",
                            id: c.id,
                            name: c.name,
                            slug: c.slug,
                            description: c.description ?? null,
                            isVisible: c.isVisible,
                          });
                          setQ("");
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-gray-900 truncate">
                            {c.name}
                          </span>
                          <span className="text-xs text-gray-400">→</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500 truncate">
                          {c.parent?.name ? `${c.parent.name} · ` : ""}/{c.slug}
                          {!c.isVisible ? " · cachée" : ""}
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-2 py-2 text-xs text-gray-500">
                    Aucune catégorie.
                  </li>
                )}
              </ul>
            </div>
            <div>
              <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Produits
              </p>
              <ul className="space-y-1">
                {prods.length ? (
                  prods.map((p) => {
                    const meta = [p.section, p.width, p.length, p.type]
                      .filter(Boolean)
                      .join(" • ");
                    const catHint = p.categories[0]?.category?.name;
                    return (
                      <li key={`p:${p.id}`}>
                        <button
                          type="button"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:bg-gray-50"
                          onClick={() => {
                            setSelectedKind("product");
                            setSelectedId(p.id);
                            setLocalSelected({
                              kind: "product",
                              id: p.id,
                              name: p.name,
                              slug: p.slug,
                              description: p.description ?? null,
                              isVisible: p.isVisible,
                            });
                            setQ("");
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-gray-900 truncate">
                              {p.name}
                            </span>
                            <span className="text-xs text-gray-400">→</span>
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500 truncate">
                            {meta || catHint ? `${meta || catHint} · ` : ""}/
                            {p.slug}
                            {!p.isVisible ? " · caché" : ""}
                          </div>
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-2 py-2 text-xs text-gray-500">
                    Aucun produit.
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminSiteContentForm({
  version,
  hero,
  family,
  aboutHistory,
  projects,
  homeTexts,
  aboutTexts,
  homeFaq,
  banner,
  siteFont,
  promo,
  contactInfo,
  catalogueItemsPreview,
}: {
  version: string;
  hero: SiteImage;
  family: SiteImage;
  aboutHistory: SiteImage;
  projects: {
    speed: "slow" | "normal" | "fast";
    slides: Array<{ src: string; alt: string }>;
  };
  homeTexts: HomeTexts;
  aboutTexts: AboutTexts;
  homeFaq: HomeFaqSettings;
  banner: { isVisible: boolean; text: string; textHtml?: string };
  siteFont: { key: string };
  promo: {
    isVisible: boolean;
    title: string;
    text: string;
    textHtml?: string;
    image: SiteImage;
  };
  contactInfo: ContactInfoSettings;
  catalogueItemsPreview: Array<{
    id: string;
    kind: "category" | "product";
    name: string;
    slug: string;
    description: string | null;
    isVisible: boolean;
  } | null>;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateSiteContentAction, null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [promoPreview, setPromoPreview] = useState<{
    title: string;
    textHtml: string;
    image: { src: string; alt: string } | null;
  } | null>(null);
  const [promoPreviewNonce, setPromoPreviewNonce] = useState(0);

  const initialFontKey: SiteFontKey = isSiteFontKey(siteFont?.key)
    ? siteFont.key
    : DEFAULT_SITE_FONT_KEY;
  const [fontPreviewKey, setFontPreviewKey] =
    useState<SiteFontKey>(initialFontKey);

  useEffect(() => {
    if (state?.ok) {
      // Recharge les données serveur (au cas où)
      router.refresh();
    }
  }, [router, state?.ok]);

  return (
    <form
      key={version}
      ref={formRef}
      action={formAction}
      className="mt-6 space-y-10 pb-28"
    >
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

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Identité visuelle — Police du site
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          La prévisualisation ci-dessous ne modifie rien côté clients. La police
          est appliquée au site seulement après
          <span className="font-medium"> Enregistrer</span>.
        </p>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Police
            </span>
            <select
              name="siteFontKey"
              value={fontPreviewKey}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
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

          <div className="rounded-xl border border-gray-200 bg-[rgba(246,241,231,0.55)] p-4">
            <p className="text-xs text-gray-500">Aperçu</p>
            <div
              className="mt-2 rounded-lg border border-gray-200 bg-white p-4"
              style={{ fontFamily: getFontFamilyStackForKey(fontPreviewKey) }}
            >
              <p className="text-sm font-semibold text-gray-900">
                Reyssac Bois
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Bois de construction, menuiserie et quincaillerie. Ce texte
                simule un contenu “en dur” ou venant de la DB.
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
              >
                Bouton d’exemple
              </button>
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
              placeholder="Reyssac Bois"
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
              placeholder="Votre expert en bois depuis 1850"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Home — Hero (badge + mini-blocs)
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Configure la pastille (badge) et les 3 mini-sections affichées dans le
          Hero.
        </p>

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
              placeholder="Bois • Quincaillerie • Conseil • Stock important"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          {[1, 2, 3].map((idx) => {
            const it = homeTexts.heroHighlights?.[idx - 1] ?? {
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
                  <label className="block lg:col-span-1">
                    <span className="mb-1 block text-sm font-medium text-gray-900">
                      Titre
                    </span>
                    <input
                      name={`homeHeroHighlightTitle_${idx}`}
                      defaultValue={it.title}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                      placeholder="Depuis 1850"
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
                      placeholder="Entreprise familiale"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Home — “Une histoire de famille”
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image"
            inputName="familySrc"
            initialUrl={family.src}
            folder="home/family"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte alternatif
            </span>
            <input
              name="familyAlt"
              defaultValue={family.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Reyssac Bois"
            />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Titre
            </span>
            <input
              name="homeFamilyTitle"
              defaultValue={homeTexts.familyTitle}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Une histoire de famille"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Paragraphe 1
            </span>
          </label>
          <RichTextEditor
            inputName="homeFamilyP1Html"
            initialHtml={homeTexts.familyP1Html ?? homeTexts.familyP1 ?? ""}
            placeholder="Texte…"
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Paragraphe 2
            </span>
          </label>
          <RichTextEditor
            inputName="homeFamilyP2Html"
            initialHtml={homeTexts.familyP2Html ?? homeTexts.familyP2 ?? ""}
            placeholder="Texte…"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Home — Catalogue
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Modifie le titre/texte et choisis jusqu’à 3 éléments (produit ou
          catégorie) à afficher avec un vrai lien.
        </p>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Titre
            </span>
            <input
              name="homeCatalogueTitle"
              defaultValue={homeTexts.catalogueTitle ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Nos produits"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte
            </span>
            <input
              name="homeCatalogueIntro"
              defaultValue={homeTexts.catalogueIntro ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Construction, bardage, terrasse…"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CatalogueItemPicker
            slot={1}
            initial={homeTexts.catalogueItems?.[0] ?? null}
            preview={catalogueItemsPreview?.[0] ?? null}
          />
          <CatalogueItemPicker
            slot={2}
            initial={homeTexts.catalogueItems?.[1] ?? null}
            preview={catalogueItemsPreview?.[1] ?? null}
          />
          <CatalogueItemPicker
            slot={3}
            initial={homeTexts.catalogueItems?.[2] ?? null}
            preview={catalogueItemsPreview?.[2] ?? null}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Home — Nos Projets (carrousel)
        </h3>
        <div className="mt-4">
          <ProjectsCarouselEditor
            initialSpeed={projects.speed}
            initialSlides={projects.slides}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Qui sommes-nous — “Notre Histoire”
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
              placeholder="Histoire Reyssac Bois"
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
              placeholder="Qui sommes-nous ?"
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
              placeholder="Notre Histoire"
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
                placeholder="Notre Mission"
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
                placeholder="Notre Localisation & Projets Futurs"
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

      <HomeFaqEditor
        initial={{
          isVisible: Boolean(homeFaq?.isVisible),
          title: homeFaq?.title ?? "",
          introHtml: homeFaq?.introHtml ?? homeFaq?.intro ?? "",
          items: (homeFaq?.items ?? []).map((it) => ({
            id: it.id,
            isVisible: Boolean(it.isVisible),
            question: it.question ?? "",
            answerHtml: it.answerHtml ?? it.answer ?? "",
          })),
        }}
      />

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Contact — Informations
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Ce bloc est affiché sur la Home dans la section “Contact” (à gauche du
          formulaire).
        </p>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Titre
            </span>
            <input
              name="contactInfoTitle"
              defaultValue={contactInfo.title}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Informations"
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte
            </span>
            <p className="mt-1 text-xs text-gray-500">
              Astuce: tu peux ajouter des liens (tel:, mailto:, /page) via le
              bouton “Lien”.
            </p>
          </label>
          <RichTextEditor
            inputName="contactInfoTextHtml"
            initialHtml={contactInfo.textHtml ?? contactInfo.text ?? ""}
            placeholder="Téléphone, horaires, adresse…"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Bannière — “Site en construction”
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Visible
            </span>
            <select
              name="bannerVisible"
              defaultValue={banner.isVisible ? "1" : "0"}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="0">Cachée</option>
              <option value="1">Visible</option>
            </select>
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte
            </span>
          </label>
        </div>

        <div className="mt-4">
          <RichTextEditor
            inputName="bannerTextHtml"
            initialHtml={banner.textHtml ?? banner.text ?? ""}
            placeholder="Site en construction — certaines informations peuvent évoluer."
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Promo / Événement — Modale
        </h3>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Astuce: utilise l’aperçu pour tester la modale sans la rendre
            visible aux clients.
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => {
              const form = formRef.current;
              if (!form) return;
              const title =
                (
                  form.elements.namedItem(
                    "promoTitle"
                  ) as HTMLInputElement | null
                )?.value ?? "";
              const textHtml =
                (
                  form.elements.namedItem(
                    "promoTextHtml"
                  ) as HTMLInputElement | null
                )?.value ?? "";
              const src =
                (
                  form.elements.namedItem(
                    "promoImageSrc"
                  ) as HTMLInputElement | null
                )?.value ?? "";
              const alt =
                (
                  form.elements.namedItem(
                    "promoImageAlt"
                  ) as HTMLInputElement | null
                )?.value ?? "";

              setPromoPreview({
                title,
                textHtml,
                image: src.trim() ? { src, alt } : null,
              });
              setPromoPreviewNonce((n) => n + 1);
            }}
          >
            Tester (aperçu admin)
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Visible
            </span>
            <select
              name="promoVisible"
              defaultValue={promo.isVisible ? "1" : "0"}
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
              name="promoTitle"
              defaultValue={promo.title}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Promo / événement"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Texte
            </span>
            <p className="mt-2 text-xs text-gray-500">
              Utilise la barre d’outils pour mettre en forme (gras, souligné,
              italique, couleur, liens).
            </p>
          </label>
        </div>

        <div className="mt-4">
          <RichTextEditor
            inputName="promoTextHtml"
            initialHtml={promo.textHtml ?? promo.text ?? ""}
            placeholder="Détails de l’offre / de l’événement…"
            helperText="Conseil: ajoute un lien (bouton “Lien”) pour activer le bouton CTA “En profiter”."
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploadField
            label="Image promo"
            inputName="promoImageSrc"
            initialUrl={promo.image.src}
            folder="promo"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Légende (texte alternatif)
            </span>
            <input
              name="promoImageAlt"
              defaultValue={promo.image.alt}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              placeholder="Photo promo"
            />
            <p className="mt-2 text-xs text-gray-500">
              Affiché sous l’image dans la modale (et utilisé aussi pour
              l’accessibilité si l’image ne charge pas).
            </p>
          </label>
        </div>
      </section>

      {promoPreview ? (
        <PromoModal
          key={promoPreviewNonce}
          mode="adminPreview"
          onRequestClose={() => setPromoPreview(null)}
          promo={{
            isVisible: true,
            title: promoPreview.title,
            text: "",
            textHtml: promoPreview.textHtml,
            image: promoPreview.image,
          }}
        />
      ) : null}

      <AdminFloatingSaveButton />
    </form>
  );
}
