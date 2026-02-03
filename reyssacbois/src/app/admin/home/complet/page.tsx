import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getConstructionBannerSettings,
  ensureHomeFaqSettings,
  getProjectsCarouselSettings,
  getPromoModalSettings,
  getSiteImage,
  ensureAboutTexts,
  ensureHomeTexts,
  ensureContactInfoSettings,
  ensureSiteFontSettings,
  getSettingsVersion,
  SITE_KEYS,
} from "@/admin/queries/siteSettings";
import AdminSiteContentForm from "../AdminSiteContentForm";

export default async function AdminHomeCompletPage() {
  const [
    hero,
    family,
    aboutHistory,
    projects,
    homeTexts,
    aboutTexts,
    faq,
    banner,
    promo,
    siteFont,
    contactInfo,
  ] = await Promise.all([
    getSiteImage(SITE_KEYS.homeHero),
    getSiteImage(SITE_KEYS.homeFamily),
    getSiteImage(SITE_KEYS.aboutHistory),
    getProjectsCarouselSettings(),
    ensureHomeTexts(),
    ensureAboutTexts(),
    ensureHomeFaqSettings(),
    getConstructionBannerSettings(),
    getPromoModalSettings(),
    ensureSiteFontSettings(),
    ensureContactInfoSettings(),
  ]);
  const version = await getSettingsVersion([
    SITE_KEYS.homeHero,
    SITE_KEYS.homeFamily,
    SITE_KEYS.aboutHistory,
    SITE_KEYS.homeProjects,
    SITE_KEYS.homeTexts,
    SITE_KEYS.aboutTexts,
    SITE_KEYS.homeFaq,
    SITE_KEYS.constructionBanner,
    SITE_KEYS.promoModal,
    SITE_KEYS.siteFont,
    SITE_KEYS.contactInfo,
  ]);

  const projectsSpeed: "slow" | "normal" | "fast" =
    projects?.intervalMs === 8000
      ? "slow"
      : projects?.intervalMs === 3000
      ? "fast"
      : "normal";

  const catalogueSlots = (homeTexts.catalogueItems ?? [])
    .slice(0, 3)
    .map((x) => {
      if (!x || !x.id || !x.kind) return null;
      if (x.kind !== "category" && x.kind !== "product") return null;
      return { kind: x.kind, id: x.id };
    });
  const configuredCatalogueItems = catalogueSlots.filter(
    (x): x is { kind: "category" | "product"; id: string } =>
      Boolean(x && x.id && x.kind)
  );
  const categoryIds = configuredCatalogueItems
    .filter((x) => x.kind === "category")
    .map((x) => x.id);
  const productIds = configuredCatalogueItems
    .filter((x) => x.kind === "product")
    .map((x) => x.id);

  const [catalogueCategories, catalogueProducts] = await Promise.all([
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

  const catalogueById = new Map<
    string,
    {
      id: string;
      kind: "category" | "product";
      name: string;
      slug: string;
      description: string | null;
      isVisible: boolean;
    }
  >();
  for (const c of catalogueCategories)
    catalogueById.set(c.id, { ...c, kind: "category" });
  for (const p of catalogueProducts)
    catalogueById.set(p.id, { ...p, kind: "product" });

  return (
    <div>
      <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Contenu du site (page complète)
            </h2>
            <p className="mt-1 text-sm text-gray-700">
              Cette page regroupe tous les blocs. Si tu préfères, utilise plutôt
              le menu `/admin/home`.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/home"
              className="text-sm text-gray-700 hover:underline"
            >
              ← Menu Home
            </Link>
            <Link
              href="/admin"
              className="text-sm text-gray-700 hover:underline"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <AdminSiteContentForm
        version={version}
        hero={hero ?? { src: "", alt: "" }}
        family={family ?? { src: "", alt: "" }}
        aboutHistory={aboutHistory ?? { src: "", alt: "" }}
        projects={{ speed: projectsSpeed, slides: projects?.slides ?? [] }}
        homeTexts={homeTexts}
        aboutTexts={aboutTexts}
        homeFaq={faq}
        banner={banner ?? { isVisible: false, text: "", textHtml: "" }}
        siteFont={siteFont}
        promo={
          promo
            ? { ...promo, image: promo.image ?? { src: "", alt: "" } }
            : {
                isVisible: false,
                title: "",
                text: "",
                textHtml: "",
                image: { src: "", alt: "" },
              }
        }
        contactInfo={contactInfo}
        catalogueItemsPreview={catalogueSlots.map((x) =>
          x ? catalogueById.get(x.id) ?? null : null
        )}
      />
    </div>
  );
}
