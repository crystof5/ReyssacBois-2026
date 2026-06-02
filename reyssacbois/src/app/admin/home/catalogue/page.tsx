import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ensureHomeTexts,
  getSettingsVersion,
  SITE_KEYS,
} from "@/admin/queries/siteSettings";
import CatalogueForm from "./CatalogueForm";

type SlotItem = { kind: "category" | "product"; id: string } | null;
type PreviewData = {
  id: string;
  kind: "category" | "product";
  name: string;
  slug: string;
  description: string | null;
  isVisible: boolean;
};
type PreviewItem = PreviewData | null;

export default async function AdminHomeCataloguePage() {
  const homeTexts = await ensureHomeTexts();
  const version = await getSettingsVersion([SITE_KEYS.homeTexts]);
  const slots: SlotItem[] = (homeTexts.catalogueItems ?? []).slice(0, 3).map((x) => {
    if (!x || !x.id || !x.kind) return null;
    if (x.kind !== "category" && x.kind !== "product") return null;
    return { kind: x.kind, id: x.id };
  });
  const configured = slots.filter(
    (x): x is { kind: "category" | "product"; id: string } => Boolean(x)
  );
  const categoryIds = configured
    .filter((x) => x.kind === "category")
    .map((x) => x.id);
  const productIds = configured
    .filter((x) => x.kind === "product")
    .map((x) => x.id);

  const [cats, prods] = await Promise.all([
    categoryIds.length
      ? prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isVisible: true,
          },
        })
      : Promise.resolve([]),
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isVisible: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const byId = new Map<string, PreviewData>();
  for (const c of cats) byId.set(c.id, { ...c, kind: "category" });
  for (const p of prods) byId.set(p.id, { ...p, kind: "product" });

  const preview: [PreviewItem, PreviewItem, PreviewItem] = [
    slots[0] ? byId.get(slots[0].id) ?? null : null,
    slots[1] ? byId.get(slots[1].id) ?? null : null,
    slots[2] ? byId.get(slots[2].id) ?? null : null,
  ];

  return (
    <div>
      <div className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Accueil — Catalogue
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              Titre/intro + 3 cartes (produit/catégorie).
            </p>

            <nav aria-label="Fil d’Ariane admin" className="mt-3">
              <ol className="inline-flex max-w-full flex-wrap items-center gap-2 border-b border-line pb-2 text-xs text-ink-600">
                <li className="min-w-0">
                  <Link
                    href="/admin"
                    className="font-medium text-ink hover:underline underline-offset-4"
                  >
                    Administration
                  </Link>
                </li>
                <li className="flex min-w-0 items-center gap-1">
                  <span className="text-line-strong" aria-hidden>
                    /
                  </span>
                  <Link
                    href="/admin/home"
                    className="font-medium text-ink-600 hover:underline underline-offset-4"
                  >
                    Accueil
                  </Link>
                </li>
                <li className="flex min-w-0 items-center gap-1">
                  <span className="text-line-strong" aria-hidden>
                    /
                  </span>
                  <span className="font-semibold text-ink">Catalogue</span>
                </li>
              </ol>
            </nav>
          </div>

          <Link
            href="/admin/home"
            className="text-sm text-ink-600 hover:underline"
          >
            ← Menu Home
          </Link>
        </div>
      </div>

      <CatalogueForm homeTexts={homeTexts} preview={preview} version={version} />
    </div>
  );
}
