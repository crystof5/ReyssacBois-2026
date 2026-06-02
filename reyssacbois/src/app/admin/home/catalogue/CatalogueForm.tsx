"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar";
import { updateHomeCatalogueAction } from "@/admin/actions/siteContentSections";

type PreviewItem = {
  id: string;
  kind: "category" | "product";
  name: string;
  slug: string;
  description: string | null;
  isVisible: boolean;
} | null;

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
  preview: PreviewItem;
}) {
  const [selectedKind, setSelectedKind] = useState<"" | "category" | "product">(
    initial?.kind ?? ""
  );
  const [selectedId, setSelectedId] = useState<string>(initial?.id ?? "");
  const [localSelected, setLocalSelected] = useState<PreviewItem>(null);

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
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs font-semibold text-ink-600">Carte {slot}</p>

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
        <div className="mt-3 rounded-xl border border-line bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {resolved?.name || `${selectedKind} • ${selectedId}`}
              </p>
              {resolved ? (
                <p className="mt-1 text-xs text-ink-600">
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
            <p className="mt-2 text-xs text-ink-600">
              {resolved.description?.trim()
                ? resolved.description
                : "Aucune description."}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-xs text-ink-600">Aucun élément sélectionné.</p>
      )}

      <div className="mt-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">
            Rechercher (produit ou catégorie)
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder="Tape 2+ caractères…"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
          />
        </label>

        {loading ? (
          <p className="mt-2 text-xs text-ink-400">Recherche…</p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}

        {hasQuery && !loading && !error ? (
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div>
              <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                Catégories
              </p>
              <ul className="space-y-1">
                {cats.length ? (
                  cats.map((c) => (
                    <li key={`c:${c.id}`}>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-left text-sm hover:bg-surface-2"
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
                          <span className="font-semibold text-ink truncate">
                            {c.name}
                          </span>
                          <span className="text-xs text-line-strong">→</span>
                        </div>
                        <div className="mt-0.5 text-xs text-ink-400 truncate">
                          {c.parent?.name ? `${c.parent.name} · ` : ""}/{c.slug}
                          {!c.isVisible ? " · cachée" : ""}
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-2 py-2 text-xs text-ink-400">
                    Aucune catégorie.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
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
                          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-left text-sm hover:bg-surface-2"
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
                            <span className="font-semibold text-ink truncate">
                              {p.name}
                            </span>
                            <span className="text-xs text-line-strong">→</span>
                          </div>
                          <div className="mt-0.5 text-xs text-ink-400 truncate">
                            {meta || catHint ? `${meta || catHint} · ` : ""}/
                            {p.slug}
                            {!p.isVisible ? " · caché" : ""}
                          </div>
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-2 py-2 text-xs text-ink-400">
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

export default function CatalogueForm({
  homeTexts,
  preview,
  version,
}: {
  homeTexts: {
    catalogueTitle?: string;
    catalogueIntro?: string;
    catalogueItems?: Array<{ kind: "category" | "product"; id: string } | null>;
  };
  preview: [PreviewItem, PreviewItem, PreviewItem];
  version: string;
}) {
  const [state, formAction] = useActionState(updateHomeCatalogueAction, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [router, state?.ok]);
  type CatalogueSlotItem = { kind: "category" | "product"; id: string } | null;
  const items: CatalogueSlotItem[] = homeTexts.catalogueItems ?? [];

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

      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <h3 className="text-sm font-semibold text-ink">
          Home — Catalogue
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Titre
            </span>
            <input
              name="homeCatalogueTitle"
              defaultValue={homeTexts.catalogueTitle ?? ""}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">
              Texte
            </span>
            <input
              name="homeCatalogueIntro"
              defaultValue={homeTexts.catalogueIntro ?? ""}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CatalogueItemPicker
            slot={1}
            initial={items[0] ?? null}
            preview={preview[0]}
          />
          <CatalogueItemPicker
            slot={2}
            initial={items[1] ?? null}
            preview={preview[1]}
          />
          <CatalogueItemPicker
            slot={3}
            initial={items[2] ?? null}
            preview={preview[2]}
          />
        </div>
      </section>

      <AdminStickySaveBar hint="Modifie, puis enregistre (la page confirme quand c’est OK)." />
    </form>
  );
}
