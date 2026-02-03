"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import {
  SITE_KEYS,
  type ConstructionBannerSettings,
  type PromoModalSettings,
  type ProjectsCarouselSettings,
} from "@/admin/queries/siteSettings";
import sanitizeHtml from "sanitize-html";
import { DEFAULT_SITE_FONT_KEY, isSiteFontKey } from "@/lib/siteFonts";
import { requireAdmin } from "@/lib/adminAuth";

type ActionState = { ok?: boolean; message?: string } | null;

function normalizeAlt(alt: string, fallback: string) {
  const a = (alt ?? "").trim();
  return a || fallback;
}

function normalizeText(value: FormDataEntryValue | null | undefined) {
  return String(value ?? "").trim();
}

function parseVisibleFlag(value: FormDataEntryValue | null | undefined) {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

function sanitizeRichTextHtml(input: string) {
  const clean = sanitizeHtml(input, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "span",
      "a",
      "ul",
      "ol",
      "li",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    allowedStyles: {
      span: {
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = String(attribs.href ?? "").trim();
        const isInternal = href.startsWith("/");
        const safeHref =
          href.startsWith("/") ||
          /^https?:\/\//i.test(href) ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
            ? href
            : "";
        return {
          tagName,
          attribs: {
            href: safeHref,
            ...(isInternal
              ? {}
              : { target: "_blank", rel: "noopener noreferrer" }),
          },
        };
      },
    },
  });
  return clean.trim();
}

function richHtmlToPlainText(html: string) {
  const withNewlines = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<\/\s*li\s*>/gi, "\n");

  const stripped = sanitizeHtml(withNewlines, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return stripped.replace(/\n{3,}/g, "\n\n").trim();
}

async function getSettingValue<T extends object>(
  key: string
): Promise<T | null> {
  const existing = await prisma.siteSetting.findUnique({
    where: { key },
    select: { value: true },
  });
  return (existing?.value as unknown as T) ?? null;
}

async function upsertSettingValue<T extends object>(key: string, value: T) {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: value as unknown as Prisma.InputJsonValue },
    update: { value: value as unknown as Prisma.InputJsonValue },
  });
}

function parseInterval(value: string) {
  if (value === "slow") return 8000;
  if (value === "fast") return 3000;
  return 5000;
}

function invalidatePublic() {
  revalidateTag("siteSettings", "default");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/categories", "layout");
  revalidatePath("/produits", "layout");
  revalidatePath("/qui-sommes-nous");
}

export async function updateHomeHeaderAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/haut");

    const siteFontKeyRaw = normalizeText(formData.get("siteFontKey"));
    const siteFontKey = isSiteFontKey(siteFontKeyRaw)
      ? siteFontKeyRaw
      : DEFAULT_SITE_FONT_KEY;

    const heroSrc = normalizeText(formData.get("heroSrc"));
    const heroAlt = normalizeAlt(
      String(formData.get("heroAlt") ?? ""),
      "Atelier Reyssac Bois"
    );

    const heroTitle = normalizeText(formData.get("homeHeroTitle"));
    const heroSubtitle = normalizeText(formData.get("homeHeroSubtitle"));
    const heroBadgeVisible = parseVisibleFlag(
      formData.get("homeHeroBadgeVisible")
    );
    const heroBadgeText = normalizeText(formData.get("homeHeroBadgeText"));
    const heroHighlights = [1, 2, 3].map((idx) => ({
      isVisible: parseVisibleFlag(
        formData.get(`homeHeroHighlightVisible_${idx}`)
      ),
      title: normalizeText(formData.get(`homeHeroHighlightTitle_${idx}`)),
      desc: normalizeText(formData.get(`homeHeroHighlightDesc_${idx}`)),
    }));

    const existingHome =
      (await getSettingValue<Record<string, unknown>>(SITE_KEYS.homeTexts)) ??
      {};
    const nextHome = {
      ...existingHome,
      heroTitle,
      heroSubtitle,
      heroBadgeVisible,
      heroBadgeText,
      heroHighlights,
    };

    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.siteFont },
        create: { key: SITE_KEYS.siteFont, value: { key: siteFontKey } },
        update: { value: { key: siteFontKey } },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeHero },
        create: {
          key: SITE_KEYS.homeHero,
          value: heroSrc
            ? { src: heroSrc, alt: heroAlt }
            : { src: "", alt: heroAlt },
        },
        update: {
          value: heroSrc
            ? { src: heroSrc, alt: heroAlt }
            : { src: "", alt: heroAlt },
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeTexts },
        create: {
          key: SITE_KEYS.homeTexts,
          value: nextHome as unknown as Prisma.InputJsonValue,
        },
        update: { value: nextHome as unknown as Prisma.InputJsonValue },
      }),
    ]);

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/haut");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}

export async function updateHomeFamilyAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/famille");

    const familySrc = normalizeText(formData.get("familySrc"));
    const familyAlt = normalizeAlt(
      String(formData.get("familyAlt") ?? ""),
      "Reyssac Bois"
    );

    const familyTitle = normalizeText(formData.get("homeFamilyTitle"));
    const p1HtmlRaw = normalizeText(formData.get("homeFamilyP1Html"));
    const p2HtmlRaw = normalizeText(formData.get("homeFamilyP2Html"));
    const p1Html = p1HtmlRaw ? sanitizeRichTextHtml(p1HtmlRaw) : "";
    const p2Html = p2HtmlRaw ? sanitizeRichTextHtml(p2HtmlRaw) : "";

    const existingHome =
      (await getSettingValue<Record<string, unknown>>(SITE_KEYS.homeTexts)) ??
      {};
    const nextHome = {
      ...existingHome,
      familyTitle,
      familyP1: p1Html
        ? richHtmlToPlainText(p1Html)
        : normalizeText(formData.get("homeFamilyP1")),
      familyP2: p2Html
        ? richHtmlToPlainText(p2Html)
        : normalizeText(formData.get("homeFamilyP2")),
      familyP1Html: p1Html || undefined,
      familyP2Html: p2Html || undefined,
    };

    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeFamily },
        create: {
          key: SITE_KEYS.homeFamily,
          value: familySrc
            ? { src: familySrc, alt: familyAlt }
            : { src: "", alt: familyAlt },
        },
        update: {
          value: familySrc
            ? { src: familySrc, alt: familyAlt }
            : { src: "", alt: familyAlt },
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeTexts },
        create: {
          key: SITE_KEYS.homeTexts,
          value: nextHome as unknown as Prisma.InputJsonValue,
        },
        update: { value: nextHome as unknown as Prisma.InputJsonValue },
      }),
    ]);

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/famille");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}

export async function updateHomeCatalogueAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/catalogue");

    const catalogueTitle = normalizeText(formData.get("homeCatalogueTitle"));
    const catalogueIntro = normalizeText(formData.get("homeCatalogueIntro"));
    const catalogueItems = [1, 2, 3].map((idx) => {
      const kindRaw = String(
        formData.get(`homeCatalogueItemKind_${idx}`) ?? ""
      ).trim();
      const id = normalizeText(formData.get(`homeCatalogueItemId_${idx}`));
      const kind =
        kindRaw === "product"
          ? "product"
          : kindRaw === "category"
          ? "category"
          : "";
      if (!kind || !id) return null;
      return { kind, id };
    });

    const existingHome =
      (await getSettingValue<Record<string, unknown>>(SITE_KEYS.homeTexts)) ??
      {};
    const nextHome = {
      ...existingHome,
      catalogueTitle,
      catalogueIntro,
      catalogueItems,
    };
    await upsertSettingValue(SITE_KEYS.homeTexts, nextHome);

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/catalogue");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}

export async function updateContactInfoAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/contact");

    const title = normalizeText(formData.get("contactInfoTitle"));
    const textHtmlRaw = normalizeText(formData.get("contactInfoTextHtml"));
    const textHtml = textHtmlRaw ? sanitizeRichTextHtml(textHtmlRaw) : "";
    const text = textHtml
      ? richHtmlToPlainText(textHtml)
      : normalizeText(formData.get("contactInfoText"));

    await upsertSettingValue(SITE_KEYS.contactInfo, {
      title,
      text,
      textHtml: textHtml || undefined,
    });

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/contact");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}

export async function updateHomeProjectsAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/projets");

    const speed = String(formData.get("projectsSpeed") ?? "normal");
    const intervalMs = parseInterval(speed);

    const slidesJson = String(formData.get("projectsSlidesJson") ?? "[]");
    let slides: Array<{ src: string; alt: string }> = [];
    try {
      const parsed: unknown = JSON.parse(slidesJson);
      if (Array.isArray(parsed)) {
        slides = parsed
          .filter((s: unknown): s is { src: unknown; alt?: unknown } => {
            if (!s || typeof s !== "object") return false;
            const src = (s as { src?: unknown }).src;
            return typeof src === "string" && src.trim().length > 0;
          })
          .map((s, idx) => ({
            src: String(s.src).trim(),
            alt: normalizeAlt(
              typeof (s as { alt?: unknown }).alt === "string"
                ? String((s as { alt: string }).alt)
                : "",
              `Projet ${idx + 1}`
            ),
          }))
          .slice(0, 50);
      }
    } catch {
      slides = [];
    }

    const value: ProjectsCarouselSettings = { intervalMs, slides };
    await upsertSettingValue(SITE_KEYS.homeProjects, value);

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/projets");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}

export async function updateConstructionBannerAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/banniere");

    const isVisible = parseVisibleFlag(formData.get("bannerVisible"));
    const textHtmlRaw = normalizeText(formData.get("bannerTextHtml"));
    const textHtml = textHtmlRaw ? sanitizeRichTextHtml(textHtmlRaw) : "";
    const text = textHtml
      ? richHtmlToPlainText(textHtml)
      : normalizeText(formData.get("bannerText"));

    const value: ConstructionBannerSettings = {
      isVisible,
      text,
      textHtml: textHtml || undefined,
    };
    await upsertSettingValue(SITE_KEYS.constructionBanner, value);

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/banniere");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}

export async function updatePromoModalAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/promo");

    const isVisible = parseVisibleFlag(formData.get("promoVisible"));
    const title = normalizeText(formData.get("promoTitle"));
    const textHtmlRaw = normalizeText(formData.get("promoTextHtml"));
    const textHtml = textHtmlRaw ? sanitizeRichTextHtml(textHtmlRaw) : "";
    const text = textHtml
      ? richHtmlToPlainText(textHtml)
      : normalizeText(formData.get("promoText"));

    const imageSrc = normalizeText(formData.get("promoImageSrc"));
    const imageAlt = normalizeAlt(
      String(formData.get("promoImageAlt") ?? ""),
      "Photo"
    );

    const value: PromoModalSettings = {
      isVisible,
      title,
      text,
      textHtml: textHtml || undefined,
      image: imageSrc ? { src: imageSrc, alt: imageAlt } : null,
    };
    await upsertSettingValue(SITE_KEYS.promoModal, value);

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/promo");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}

export async function updateAboutTextsAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/a-propos");

    const aboutHistorySrc = normalizeText(formData.get("aboutHistorySrc"));
    const aboutHistoryAlt = normalizeAlt(
      String(formData.get("aboutHistoryAlt") ?? ""),
      "Histoire Reyssac Bois"
    );

    const aboutHistoryTextHtmlRaw = normalizeText(
      formData.get("aboutHistoryTextHtml")
    );
    const aboutMissionTextHtmlRaw = normalizeText(
      formData.get("aboutMissionTextHtml")
    );
    const aboutLocationTextHtmlRaw = normalizeText(
      formData.get("aboutLocationTextHtml")
    );
    const aboutConclusionTextHtmlRaw = normalizeText(
      formData.get("aboutConclusionTextHtml")
    );

    const aboutHistoryTextHtml = aboutHistoryTextHtmlRaw
      ? sanitizeRichTextHtml(aboutHistoryTextHtmlRaw)
      : "";
    const aboutMissionTextHtml = aboutMissionTextHtmlRaw
      ? sanitizeRichTextHtml(aboutMissionTextHtmlRaw)
      : "";
    const aboutLocationTextHtml = aboutLocationTextHtmlRaw
      ? sanitizeRichTextHtml(aboutLocationTextHtmlRaw)
      : "";
    const aboutConclusionTextHtml = aboutConclusionTextHtmlRaw
      ? sanitizeRichTextHtml(aboutConclusionTextHtmlRaw)
      : "";

    const aboutTexts = {
      pageTitle: normalizeText(formData.get("aboutPageTitle")),
      historyTitle: normalizeText(formData.get("aboutHistoryTitle")),
      historyText: aboutHistoryTextHtml
        ? richHtmlToPlainText(aboutHistoryTextHtml)
        : normalizeText(formData.get("aboutHistoryText")),
      missionTitle: normalizeText(formData.get("aboutMissionTitle")),
      missionText: aboutMissionTextHtml
        ? richHtmlToPlainText(aboutMissionTextHtml)
        : normalizeText(formData.get("aboutMissionText")),
      locationTitle: normalizeText(formData.get("aboutLocationTitle")),
      locationText: aboutLocationTextHtml
        ? richHtmlToPlainText(aboutLocationTextHtml)
        : normalizeText(formData.get("aboutLocationText")),
      conclusionText: aboutConclusionTextHtml
        ? richHtmlToPlainText(aboutConclusionTextHtml)
        : normalizeText(formData.get("aboutConclusionText")),
      historyTextHtml: aboutHistoryTextHtml || undefined,
      missionTextHtml: aboutMissionTextHtml || undefined,
      locationTextHtml: aboutLocationTextHtml || undefined,
      conclusionTextHtml: aboutConclusionTextHtml || undefined,
    };

    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.aboutHistory },
        create: {
          key: SITE_KEYS.aboutHistory,
          value: aboutHistorySrc
            ? { src: aboutHistorySrc, alt: aboutHistoryAlt }
            : { src: "", alt: aboutHistoryAlt },
        },
        update: {
          value: aboutHistorySrc
            ? { src: aboutHistorySrc, alt: aboutHistoryAlt }
            : { src: "", alt: aboutHistoryAlt },
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.aboutTexts },
        create: {
          key: SITE_KEYS.aboutTexts,
          value: aboutTexts as unknown as Prisma.InputJsonValue,
        },
        update: { value: aboutTexts as unknown as Prisma.InputJsonValue },
      }),
    ]);

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/a-propos");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}

export async function updateHomeFaqAction(
  _prev: ActionState,
  formData: FormData
) {
  try {
    await requireAdmin("/admin/home/faq");

    const faqVisible = parseVisibleFlag(formData.get("faqVisible"));
    const faqTitle = normalizeText(formData.get("faqTitle"));
    const faqIntroHtmlRaw = normalizeText(formData.get("faqIntroHtml"));
    const faqIntroHtml = faqIntroHtmlRaw
      ? sanitizeRichTextHtml(faqIntroHtmlRaw)
      : "";
    const faqIntro = faqIntroHtml
      ? richHtmlToPlainText(faqIntroHtml)
      : normalizeText(formData.get("faqIntro"));

    const faqIdsRaw = normalizeText(formData.get("faqIds"));
    let faqIds: string[] = [];
    try {
      const parsed: unknown = JSON.parse(faqIdsRaw || "[]");
      if (Array.isArray(parsed)) {
        faqIds = parsed
          .map((v) => String(v ?? "").trim())
          .filter(Boolean)
          .slice(0, 30);
      }
    } catch {
      faqIds = [];
    }

    const items = faqIds
      .map((id) => {
        const question = normalizeText(formData.get(`faqQuestion_${id}`));
        const answerHtmlRaw = normalizeText(
          formData.get(`faqAnswerHtml_${id}`)
        );
        const answerHtml = answerHtmlRaw
          ? sanitizeRichTextHtml(answerHtmlRaw)
          : "";
        const answer = answerHtml
          ? richHtmlToPlainText(answerHtml)
          : normalizeText(formData.get(`faqAnswer_${id}`));
        const isVisible = parseVisibleFlag(
          formData.get(`faqItemVisible_${id}`)
        );
        return {
          id,
          isVisible,
          question,
          answer,
          answerHtml: answerHtml || undefined,
        };
      })
      .filter(
        (x) =>
          x.question.trim() || x.answer.trim() || (x.answerHtml ?? "").trim()
      );

    await upsertSettingValue(SITE_KEYS.homeFaq, {
      isVisible: faqVisible,
      title: faqTitle,
      intro: faqIntro,
      introHtml: faqIntroHtml || undefined,
      items,
    });

    invalidatePublic();
    revalidatePath("/admin/home");
    revalidatePath("/admin/home/faq");
    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}
