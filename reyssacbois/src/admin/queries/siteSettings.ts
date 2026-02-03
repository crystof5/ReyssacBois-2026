import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

export type SiteImage = {
  src: string;
  alt: string;
};

export type ProjectsCarouselSettings = {
  intervalMs: number;
  slides: SiteImage[];
};

export const SITE_KEYS = {
  homeHero: "home.hero",
  homeFamily: "home.family",
  homeProjects: "home.projects",
  aboutHistory: "about.history",
  homeTexts: "home.texts",
  aboutTexts: "about.texts",
  homeFaq: "home.faq",
  contactInfo: "contact.info",
  promoModal: "site.promoModal",
  constructionBanner: "site.constructionBanner",
  siteFont: "site.font",
} as const;

const SITE_SETTINGS_TAG = "siteSettings";

const getSettingCached = unstable_cache(
  async (key: string) => {
    return await prisma.siteSetting.findUnique({
      where: { key },
      select: { value: true, updatedAt: true },
    });
  },
  ["siteSetting"],
  {
    // Très important: cache serveur pour éviter de taper la DB à chaque request (Vercel + pooler).
    // L'admin invalide ce cache via revalidateTag(SITE_SETTINGS_TAG, "default").
    // En dev: revalidate court pour limiter l'attente lors de changements manuels DB.
    // En prod: 30 minutes (mais invalidable instantanément via revalidateTag).
    revalidate: process.env.NODE_ENV !== "production" ? 5 : 60 * 30,
    tags: [SITE_SETTINGS_TAG],
  }
);

async function getSetting(key: string) {
  // En dev, on utilise aussi le cache pour accélérer la navigation admin.
  // Les écrans admin invalident ce cache via revalidateTag("siteSettings", "default") après Enregistrer.
  return await getSettingCached(key);
}

export async function getSettingsVersion(keys: readonly string[]) {
  const uniqueSorted = Array.from(new Set(keys)).sort();
  if (!uniqueSorted.length) return "0";

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: uniqueSorted } },
    select: { updatedAt: true },
  });
  const maxMs = rows.reduce((acc, row) => {
    const ms = row.updatedAt instanceof Date ? row.updatedAt.getTime() : 0;
    return ms > acc ? ms : acc;
  }, 0);
  return String(maxMs || 0);
}

export async function getSiteImage(key: string): Promise<SiteImage | null> {
  const setting = await getSetting(key);
  if (!setting) return null;

  const value = setting.value as unknown as Partial<SiteImage>;
  const src = typeof value.src === "string" ? value.src.trim() : "";
  if (!src) return null;
  const alt =
    typeof value.alt === "string" && value.alt.trim()
      ? value.alt.trim()
      : "Photo";
  return { src, alt };
}

export async function getProjectsCarouselSettings(): Promise<ProjectsCarouselSettings | null> {
  const setting = await getSetting(SITE_KEYS.homeProjects);
  if (!setting) return null;

  const value = setting.value as unknown as Partial<ProjectsCarouselSettings>;
  const intervalMs =
    typeof value.intervalMs === "number" ? value.intervalMs : 5000;
  const slides = Array.isArray(value.slides) ? (value.slides as unknown[]) : [];

  const normalizedSlides = slides
    .filter((s: unknown): s is { src: unknown; alt?: unknown } => {
      if (!s || typeof s !== "object") return false;
      const src = (s as { src?: unknown }).src;
      return typeof src === "string" && src.trim().length > 0;
    })
    .map((s) => ({
      src: String(s.src),
      alt: typeof s.alt === "string" && s.alt.trim() ? s.alt.trim() : "Photo",
    }));

  return { intervalMs, slides: normalizedSlides };
}

export type ConstructionBannerSettings = {
  isVisible: boolean;
  text: string;
  textHtml?: string;
};

export async function getConstructionBannerSettings(): Promise<ConstructionBannerSettings | null> {
  const setting = await getSetting(SITE_KEYS.constructionBanner);
  if (!setting) return null;

  const value = setting.value as unknown as Partial<ConstructionBannerSettings>;
  const isVisible = Boolean(value.isVisible);
  const text = typeof value.text === "string" ? value.text.trim() : "";
  const textHtml =
    typeof (value as { textHtml?: unknown }).textHtml === "string"
      ? String((value as { textHtml: string }).textHtml).trim()
      : "";
  return { isVisible, text, textHtml: textHtml || undefined };
}

export type PromoModalSettings = {
  isVisible: boolean;
  title: string;
  text: string;
  textHtml?: string;
  image?: SiteImage | null;
};

export async function getPromoModalSettings(): Promise<PromoModalSettings | null> {
  const setting = await getSetting(SITE_KEYS.promoModal);
  if (!setting) return null;

  const value = setting.value as unknown as Partial<PromoModalSettings>;
  const isVisible = Boolean(value.isVisible);
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const text = typeof value.text === "string" ? value.text.trim() : "";
  const textHtml =
    typeof (value as { textHtml?: unknown }).textHtml === "string"
      ? String((value as { textHtml: string }).textHtml).trim()
      : "";
  const imageValue = (value as { image?: unknown }).image;
  const image =
    imageValue &&
    typeof imageValue === "object" &&
    typeof (imageValue as { src?: unknown }).src === "string" &&
    (imageValue as { src: string }).src.trim()
      ? {
          src: (imageValue as { src: string }).src.trim(),
          alt:
            typeof (imageValue as { alt?: unknown }).alt === "string" &&
            (imageValue as { alt: string }).alt.trim()
              ? (imageValue as { alt: string }).alt.trim()
              : "Photo",
        }
      : null;

  return { isVisible, title, text, textHtml: textHtml || undefined, image };
}

export type HomeTexts = {
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

export async function getHomeTexts(): Promise<HomeTexts | null> {
  const setting = await getSetting(SITE_KEYS.homeTexts);
  if (!setting) return null;
  const value = setting.value as unknown as Partial<HomeTexts>;
  return {
    heroTitle: typeof value.heroTitle === "string" ? value.heroTitle : "",
    heroSubtitle:
      typeof value.heroSubtitle === "string" ? value.heroSubtitle : "",
    heroBadgeVisible:
      typeof (value as { heroBadgeVisible?: unknown }).heroBadgeVisible ===
      "boolean"
        ? Boolean((value as { heroBadgeVisible: boolean }).heroBadgeVisible)
        : undefined,
    heroBadgeText:
      typeof (value as { heroBadgeText?: unknown }).heroBadgeText === "string"
        ? String((value as { heroBadgeText: string }).heroBadgeText)
        : undefined,
    heroHighlights: Array.isArray(
      (value as { heroHighlights?: unknown }).heroHighlights
    )
      ? (value as { heroHighlights: unknown[] }).heroHighlights
          .filter((x) => x && typeof x === "object")
          .map((x) => {
            const o = x as Record<string, unknown>;
            return {
              isVisible:
                typeof o.isVisible === "boolean"
                  ? o.isVisible
                  : Boolean(o.isVisible),
              title: typeof o.title === "string" ? o.title : "",
              desc: typeof o.desc === "string" ? o.desc : "",
            };
          })
      : undefined,
    familyTitle: typeof value.familyTitle === "string" ? value.familyTitle : "",
    familyP1: typeof value.familyP1 === "string" ? value.familyP1 : "",
    familyP2: typeof value.familyP2 === "string" ? value.familyP2 : "",
    familyP1Html:
      typeof (value as { familyP1Html?: unknown }).familyP1Html === "string"
        ? String((value as { familyP1Html: string }).familyP1Html)
        : undefined,
    familyP2Html:
      typeof (value as { familyP2Html?: unknown }).familyP2Html === "string"
        ? String((value as { familyP2Html: string }).familyP2Html)
        : undefined,
    catalogueTitle:
      typeof (value as { catalogueTitle?: unknown }).catalogueTitle === "string"
        ? String((value as { catalogueTitle: string }).catalogueTitle)
        : undefined,
    catalogueIntro:
      typeof (value as { catalogueIntro?: unknown }).catalogueIntro === "string"
        ? String((value as { catalogueIntro: string }).catalogueIntro)
        : undefined,
    catalogueItems: Array.isArray(
      (value as { catalogueItems?: unknown }).catalogueItems
    )
      ? (value as { catalogueItems: unknown[] }).catalogueItems
          .slice(0, 3)
          .map((x) => {
            if (!x || typeof x !== "object") return null;
            const o = x as Record<string, unknown>;
            const kind =
              o.kind === "product"
                ? "product"
                : o.kind === "category"
                ? "category"
                : null;
            const id = typeof o.id === "string" ? o.id.trim() : "";
            if (!kind || !id) return null;
            return { kind, id };
          })
      : undefined,
  };
}

export type ContactInfoSettings = {
  title: string;
  text: string;
  textHtml?: string;
};

export async function getContactInfoSettings(): Promise<ContactInfoSettings | null> {
  const setting = await getSetting(SITE_KEYS.contactInfo);
  if (!setting) return null;
  const value = setting.value as unknown as Partial<ContactInfoSettings>;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const text = typeof value.text === "string" ? value.text.trim() : "";
  const textHtml =
    typeof (value as { textHtml?: unknown }).textHtml === "string"
      ? String((value as { textHtml: string }).textHtml).trim()
      : "";
  return { title, text, textHtml: textHtml || undefined };
}

export type AboutTexts = {
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

export async function getAboutTexts(): Promise<AboutTexts | null> {
  const setting = await getSetting(SITE_KEYS.aboutTexts);
  if (!setting) return null;
  const value = setting.value as unknown as Partial<AboutTexts>;
  return {
    pageTitle: typeof value.pageTitle === "string" ? value.pageTitle : "",
    historyTitle:
      typeof value.historyTitle === "string" ? value.historyTitle : "",
    historyText: typeof value.historyText === "string" ? value.historyText : "",
    missionTitle:
      typeof value.missionTitle === "string" ? value.missionTitle : "",
    missionText: typeof value.missionText === "string" ? value.missionText : "",
    locationTitle:
      typeof value.locationTitle === "string" ? value.locationTitle : "",
    locationText:
      typeof value.locationText === "string" ? value.locationText : "",
    conclusionText:
      typeof value.conclusionText === "string" ? value.conclusionText : "",
    historyTextHtml:
      typeof (value as { historyTextHtml?: unknown }).historyTextHtml ===
      "string"
        ? String((value as { historyTextHtml: string }).historyTextHtml)
        : undefined,
    missionTextHtml:
      typeof (value as { missionTextHtml?: unknown }).missionTextHtml ===
      "string"
        ? String((value as { missionTextHtml: string }).missionTextHtml)
        : undefined,
    locationTextHtml:
      typeof (value as { locationTextHtml?: unknown }).locationTextHtml ===
      "string"
        ? String((value as { locationTextHtml: string }).locationTextHtml)
        : undefined,
    conclusionTextHtml:
      typeof (value as { conclusionTextHtml?: unknown }).conclusionTextHtml ===
      "string"
        ? String((value as { conclusionTextHtml: string }).conclusionTextHtml)
        : undefined,
  };
}

export type HomeFaqItem = {
  id: string;
  isVisible: boolean;
  question: string;
  answer: string;
  answerHtml?: string;
};

export type HomeFaqSettings = {
  isVisible: boolean;
  title: string;
  intro: string;
  introHtml?: string;
  items: HomeFaqItem[];
};

export async function getHomeFaqSettings(): Promise<HomeFaqSettings | null> {
  const setting = await getSetting(SITE_KEYS.homeFaq);
  if (!setting) return null;

  const value = setting.value as unknown as Partial<HomeFaqSettings>;
  const itemsRaw = Array.isArray((value as { items?: unknown }).items)
    ? (value as { items: unknown[] }).items
    : [];
  const items: HomeFaqItem[] = itemsRaw
    .filter((it) => it && typeof it === "object")
    .map((it, idx) => {
      const o = it as Record<string, unknown>;
      const id =
        typeof o.id === "string" && o.id.trim()
          ? o.id.trim()
          : `faq-${idx + 1}`;
      const question = typeof o.question === "string" ? o.question : "";
      const answer = typeof o.answer === "string" ? o.answer : "";
      const answerHtml =
        typeof o.answerHtml === "string" ? String(o.answerHtml) : "";
      const isVisible =
        typeof o.isVisible === "boolean" ? o.isVisible : Boolean(o.isVisible);
      return {
        id,
        isVisible,
        question,
        answer,
        answerHtml: answerHtml || undefined,
      };
    });

  return {
    isVisible: Boolean(value.isVisible),
    title: typeof value.title === "string" ? value.title : "",
    intro: typeof value.intro === "string" ? value.intro : "",
    introHtml:
      typeof (value as { introHtml?: unknown }).introHtml === "string"
        ? String((value as { introHtml: string }).introHtml)
        : undefined,
    items,
  };
}

export type SiteFontSettings = {
  key: string;
};

export async function getSiteFontSettings(): Promise<SiteFontSettings | null> {
  const setting = await getSetting(SITE_KEYS.siteFont);
  if (!setting) return null;
  const value = setting.value as unknown as Partial<SiteFontSettings>;
  return { key: typeof value.key === "string" ? value.key : "" };
}

// --- Defaults + backfill (utilisé côté admin uniquement) ---

export const DEFAULT_HOME_TEXTS: HomeTexts = {
  heroTitle: "Reyssac Bois",
  heroSubtitle: "Votre expert en bois depuis 1850",
  heroBadgeVisible: true,
  heroBadgeText: "Bois • Quincaillerie • Conseil • Stock important",
  heroHighlights: [
    { isVisible: true, title: "Depuis 1850", desc: "Entreprise familiale" },
    { isVisible: true, title: "Conseil", desc: "Pro & particuliers" },
    { isVisible: true, title: "Stock", desc: "Disponibilité rapide" },
  ],
  familyTitle: "Une histoire de famille",
  familyP1:
    "Implantée à Boé et Bon-Encontre, proche d'Agen, l'entreprise Reyssac Bois a vu le jour en 1850. Depuis, notre passion et notre expertise du bois se sont transmises de père en fils sur cinq générations.",
  familyP2:
    "Nos équipes sont prêtes à accueillir aussi bien les professionnels que les particuliers. Avec un stock important à disposition, nous nous efforçons de répondre à chaque demande avec précision.",
  catalogueTitle: "Nos produits",
  catalogueIntro:
    "Construction, bardage, terrasse, quincaillerie… trouvez rapidement ce qu’il vous faut par catégories.",
  catalogueItems: [null, null, null],
};

export const DEFAULT_ABOUT_TEXTS: AboutTexts = {
  pageTitle: "Qui sommes-nous ?",
  historyTitle: "Notre Histoire",
  historyText:
    "L'histoire débute il y a plus de 170 ans. Jean Reyssac, l'arrière-arrière grand-père de Benoît, l'actuel gérant, crée la société Reyssac Bois en 1850. Maraicher à l'époque, il commercialise désormais les bois du Nord et de Pays. La propriété étendue jusqu'au canal, permettait la livraison des bois par péniche en provenance de Bordeaux.",
  missionTitle: "Notre Mission",
  missionText:
    "Notre mission est principalement la satisfaction du client et sa fidélisation. Nous favorisons des produits d'origine française et certifiés PEFC. Du professionnel au particulier, de la baguette à la palette, nous oeuvrons à trouver la bonne solution à chacun de nos clients.",
  locationTitle: "Notre Localisation & Projets Futurs",
  locationText:
    "Notre connaissance du bois transmise de générations en générations nous permet de conseiller, guider et accompagner chaque personne dans ses projets. Notre localisation est une force, aux portes d'Agen et à mi-chemin entre Bordeaux et Toulouse, nous sommes au coeur du Sud-Ouest. Aujourd'hui, nous sommes fiers d'être indépendants et sommes excités pour nos futurs projets, notamment la rénovation de nos bâtiments historiques.",
  conclusionText:
    "173 années d'existence font de l'entreprise familiale le plus vieux commerce d'Agen. Hâte de vous recevoir dans nos locaux !",
};

export const DEFAULT_HOME_FAQ: HomeFaqSettings = {
  isVisible: true,
  title: "Questions fréquentes (livraison, agglomération d’Agen, conseils)",
  intro:
    "Livraison de bois dans l’agglomération d’Agen, accueil des particuliers et pros, conseil personnalisé… Voici les réponses aux questions les plus courantes.",
  items: [
    {
      id: "faq-1",
      isVisible: true,
      question: "Livrez-vous du bois dans l’agglomération d’Agen ?",
      answer:
        "Oui. Nous pouvons organiser la livraison de bois dans l’agglomération d’Agen (Agen, Boé, Bon-Encontre, Le Passage… selon le type de produit, le volume et la tournée). Pour un besoin précis, le plus simple est de nous contacter pour vérifier la disponibilité et le délai.",
    },
    {
      id: "faq-2",
      isVisible: true,
      question: "Jusqu’où livrez-vous (Agen, Toulouse, Bordeaux) ?",
      answer:
        "Nous livrons principalement dans l’agglomération d’Agen. Pour des livraisons plus éloignées (Toulouse, Bordeaux…), c’est possible sur demande pour une commande adaptée (volume, accessibilité, planning).",
    },
    {
      id: "faq-3",
      isVisible: true,
      question: "Vendez-vous aux particuliers et aux professionnels ?",
      answer:
        "Oui. Nous accueillons particuliers et professionnels : construction, terrasse, bardage, menuiserie, quincaillerie… On vous aide à choisir les bons produits et quantités selon le projet.",
    },
    {
      id: "faq-4",
      isVisible: true,
      question: "Proposez-vous du conseil personnalisé pour mon projet ?",
      answer:
        "Oui. Notre équipe vous conseille sur les sections, les usages, le traitement (autoclave, saturateur…), les fixations et les bonnes pratiques de pose. Si besoin, on vous accompagne pour cadrer la commande.",
    },
    {
      id: "faq-5",
      isVisible: true,
      question: "Avez-vous du stock et du sur-mesure ?",
      answer:
        "Nous avons un stock important sur de nombreuses références. Pour certains besoins spécifiques, nous pouvons aussi étudier une commande sur mesure (produit, dimensions, quantité).",
    },
  ],
};

export const DEFAULT_SITE_FONT: SiteFontSettings = {
  key: "inter",
};

export const DEFAULT_CONTACT_INFO: ContactInfoSettings = {
  title: "Informations",
  text: "Téléphone : 05 53 96 15 97\nHoraires : Lun–Ven, 8h–18h",
};

async function ensureSettingValue<T extends object>(
  key: string,
  defaultValue: T
): Promise<T> {
  const existing = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  });
  if (existing) return existing.value as unknown as T;

  try {
    await prisma.siteSetting.create({
      data: { key, value: defaultValue as unknown as Prisma.InputJsonValue },
    });
  } catch {
    // possible race (unique key) -> ignore
  }

  const after = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  });
  return (after?.value as unknown as T) ?? defaultValue;
}

export async function ensureHomeTexts(): Promise<HomeTexts> {
  const value = await ensureSettingValue<HomeTexts>(
    SITE_KEYS.homeTexts,
    DEFAULT_HOME_TEXTS
  );
  return {
    heroTitle:
      typeof value.heroTitle === "string"
        ? value.heroTitle
        : DEFAULT_HOME_TEXTS.heroTitle,
    heroSubtitle:
      typeof value.heroSubtitle === "string"
        ? value.heroSubtitle
        : DEFAULT_HOME_TEXTS.heroSubtitle,
    heroBadgeVisible:
      typeof (value as { heroBadgeVisible?: unknown }).heroBadgeVisible ===
      "boolean"
        ? Boolean((value as { heroBadgeVisible: boolean }).heroBadgeVisible)
        : DEFAULT_HOME_TEXTS.heroBadgeVisible,
    heroBadgeText:
      typeof (value as { heroBadgeText?: unknown }).heroBadgeText === "string"
        ? String((value as { heroBadgeText: string }).heroBadgeText)
        : DEFAULT_HOME_TEXTS.heroBadgeText,
    heroHighlights: Array.isArray(
      (value as { heroHighlights?: unknown }).heroHighlights
    )
      ? (value as { heroHighlights: unknown[] }).heroHighlights
          .filter((x) => x && typeof x === "object")
          .map((x, idx) => {
            const o = x as Record<string, unknown>;
            const fallback = DEFAULT_HOME_TEXTS.heroHighlights?.[idx] ?? {
              isVisible: true,
              title: "",
              desc: "",
            };
            return {
              isVisible:
                typeof o.isVisible === "boolean"
                  ? o.isVisible
                  : fallback.isVisible,
              title: typeof o.title === "string" ? o.title : fallback.title,
              desc: typeof o.desc === "string" ? o.desc : fallback.desc,
            };
          })
          .slice(0, 3)
      : DEFAULT_HOME_TEXTS.heroHighlights,
    familyTitle:
      typeof value.familyTitle === "string"
        ? value.familyTitle
        : DEFAULT_HOME_TEXTS.familyTitle,
    familyP1:
      typeof value.familyP1 === "string"
        ? value.familyP1
        : DEFAULT_HOME_TEXTS.familyP1,
    familyP2:
      typeof value.familyP2 === "string"
        ? value.familyP2
        : DEFAULT_HOME_TEXTS.familyP2,
    familyP1Html:
      typeof (value as { familyP1Html?: unknown }).familyP1Html === "string"
        ? String((value as { familyP1Html: string }).familyP1Html)
        : undefined,
    familyP2Html:
      typeof (value as { familyP2Html?: unknown }).familyP2Html === "string"
        ? String((value as { familyP2Html: string }).familyP2Html)
        : undefined,
    catalogueTitle:
      typeof (value as { catalogueTitle?: unknown }).catalogueTitle === "string"
        ? String((value as { catalogueTitle: string }).catalogueTitle)
        : DEFAULT_HOME_TEXTS.catalogueTitle,
    catalogueIntro:
      typeof (value as { catalogueIntro?: unknown }).catalogueIntro === "string"
        ? String((value as { catalogueIntro: string }).catalogueIntro)
        : DEFAULT_HOME_TEXTS.catalogueIntro,
    catalogueItems: Array.isArray(
      (value as { catalogueItems?: unknown }).catalogueItems
    )
      ? (value as { catalogueItems: unknown[] }).catalogueItems
          .slice(0, 3)
          .map((x) => {
            if (!x || typeof x !== "object") return null;
            const o = x as Record<string, unknown>;
            const kind =
              o.kind === "product"
                ? "product"
                : o.kind === "category"
                ? "category"
                : null;
            const id = typeof o.id === "string" ? o.id.trim() : "";
            if (!kind || !id) return null;
            return { kind, id } as { kind: "category" | "product"; id: string };
          })
      : DEFAULT_HOME_TEXTS.catalogueItems,
  };
}

export async function ensureAboutTexts(): Promise<AboutTexts> {
  const value = await ensureSettingValue<AboutTexts>(
    SITE_KEYS.aboutTexts,
    DEFAULT_ABOUT_TEXTS
  );
  return {
    pageTitle:
      typeof value.pageTitle === "string"
        ? value.pageTitle
        : DEFAULT_ABOUT_TEXTS.pageTitle,
    historyTitle:
      typeof value.historyTitle === "string"
        ? value.historyTitle
        : DEFAULT_ABOUT_TEXTS.historyTitle,
    historyText:
      typeof value.historyText === "string"
        ? value.historyText
        : DEFAULT_ABOUT_TEXTS.historyText,
    missionTitle:
      typeof value.missionTitle === "string"
        ? value.missionTitle
        : DEFAULT_ABOUT_TEXTS.missionTitle,
    missionText:
      typeof value.missionText === "string"
        ? value.missionText
        : DEFAULT_ABOUT_TEXTS.missionText,
    locationTitle:
      typeof value.locationTitle === "string"
        ? value.locationTitle
        : DEFAULT_ABOUT_TEXTS.locationTitle,
    locationText:
      typeof value.locationText === "string"
        ? value.locationText
        : DEFAULT_ABOUT_TEXTS.locationText,
    conclusionText:
      typeof value.conclusionText === "string"
        ? value.conclusionText
        : DEFAULT_ABOUT_TEXTS.conclusionText,
    historyTextHtml:
      typeof (value as { historyTextHtml?: unknown }).historyTextHtml ===
      "string"
        ? String((value as { historyTextHtml: string }).historyTextHtml)
        : undefined,
    missionTextHtml:
      typeof (value as { missionTextHtml?: unknown }).missionTextHtml ===
      "string"
        ? String((value as { missionTextHtml: string }).missionTextHtml)
        : undefined,
    locationTextHtml:
      typeof (value as { locationTextHtml?: unknown }).locationTextHtml ===
      "string"
        ? String((value as { locationTextHtml: string }).locationTextHtml)
        : undefined,
    conclusionTextHtml:
      typeof (value as { conclusionTextHtml?: unknown }).conclusionTextHtml ===
      "string"
        ? String((value as { conclusionTextHtml: string }).conclusionTextHtml)
        : undefined,
  };
}

export async function ensureHomeFaqSettings(): Promise<HomeFaqSettings> {
  const value = await ensureSettingValue<HomeFaqSettings>(
    SITE_KEYS.homeFaq,
    DEFAULT_HOME_FAQ
  );
  const itemsRaw = Array.isArray((value as { items?: unknown }).items)
    ? (value as { items: unknown[] }).items
    : [];
  const items: HomeFaqItem[] = itemsRaw
    .filter((it) => it && typeof it === "object")
    .map((it, idx) => {
      const o = it as Record<string, unknown>;
      const id =
        typeof o.id === "string" && o.id.trim()
          ? o.id.trim()
          : `faq-${idx + 1}`;
      const question = typeof o.question === "string" ? o.question : "";
      const answer = typeof o.answer === "string" ? o.answer : "";
      const answerHtml =
        typeof o.answerHtml === "string" ? String(o.answerHtml) : "";
      const isVisible =
        typeof o.isVisible === "boolean" ? o.isVisible : Boolean(o.isVisible);
      return {
        id,
        isVisible,
        question,
        answer,
        answerHtml: answerHtml || undefined,
      };
    });

  return {
    isVisible:
      typeof (value as { isVisible?: unknown }).isVisible === "boolean"
        ? Boolean((value as { isVisible: boolean }).isVisible)
        : DEFAULT_HOME_FAQ.isVisible,
    title:
      typeof (value as { title?: unknown }).title === "string"
        ? (value as { title: string }).title
        : DEFAULT_HOME_FAQ.title,
    intro:
      typeof (value as { intro?: unknown }).intro === "string"
        ? (value as { intro: string }).intro
        : DEFAULT_HOME_FAQ.intro,
    introHtml:
      typeof (value as { introHtml?: unknown }).introHtml === "string"
        ? String((value as { introHtml: string }).introHtml)
        : undefined,
    items: items.length ? items : DEFAULT_HOME_FAQ.items,
  };
}

export async function ensureSiteFontSettings(): Promise<SiteFontSettings> {
  const value = await ensureSettingValue<SiteFontSettings>(
    SITE_KEYS.siteFont,
    DEFAULT_SITE_FONT
  );
  return {
    key: typeof value.key === "string" ? value.key : DEFAULT_SITE_FONT.key,
  };
}

export async function ensureContactInfoSettings(): Promise<ContactInfoSettings> {
  const value = await ensureSettingValue<ContactInfoSettings>(
    SITE_KEYS.contactInfo,
    DEFAULT_CONTACT_INFO
  );
  const title =
    typeof value.title === "string" ? value.title : DEFAULT_CONTACT_INFO.title;
  const text =
    typeof value.text === "string" ? value.text : DEFAULT_CONTACT_INFO.text;
  const textHtml =
    typeof (value as { textHtml?: unknown }).textHtml === "string"
      ? String((value as { textHtml: string }).textHtml)
      : "";
  return { title, text, textHtml: textHtml || undefined };
}
