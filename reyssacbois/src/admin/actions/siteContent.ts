"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { SITE_KEYS } from "@/admin/queries/siteSettings";
import sanitizeHtml from "sanitize-html";
import { DEFAULT_SITE_FONT_KEY, isSiteFontKey } from "@/lib/siteFonts";
import { requireAdmin } from "@/lib/adminAuth";

function parseInterval(value: string) {
  if (value === "slow") return 8000;
  if (value === "fast") return 3000;
  return 5000;
}

function normalizeAlt(alt: string, fallback: string) {
  const a = alt.trim();
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

export async function updateSiteContentAction(
  _prevState: { ok?: boolean; message?: string } | null,
  formData: FormData
) {
  // (Ce fichier est utilisé via useActionState côté client, donc on retourne un état plutôt qu'un redirect.)
  try {
    await requireAdmin("/admin/home");

    const siteFontKeyRaw = String(formData.get("siteFontKey") ?? "").trim();
    const siteFontKey = isSiteFontKey(siteFontKeyRaw)
      ? siteFontKeyRaw
      : DEFAULT_SITE_FONT_KEY;

    const heroSrc = normalizeText(formData.get("heroSrc"));
    const heroAlt = normalizeAlt(
      String(formData.get("heroAlt") ?? ""),
      "Atelier Reyssac Bois"
    );

    const familySrc = normalizeText(formData.get("familySrc"));
    const familyAlt = normalizeAlt(
      String(formData.get("familyAlt") ?? ""),
      "Reyssac Bois"
    );

    const aboutHistorySrc = normalizeText(formData.get("aboutHistorySrc"));
    const aboutHistoryAlt = normalizeAlt(
      String(formData.get("aboutHistoryAlt") ?? ""),
      "Histoire Reyssac Bois"
    );

    const projectsSpeed = String(formData.get("projectsSpeed") ?? "normal");
    const projectsIntervalMs = parseInterval(projectsSpeed);

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
              typeof s.alt === "string" ? s.alt : "",
              `Projet ${idx + 1}`
            ),
          }))
          .slice(0, 50); // garde-fou
      }
    } catch {
      // ignore => pas de slides
    }

    // Textes Home / About
    const homeFamilyP1HtmlRaw = normalizeText(formData.get("homeFamilyP1Html"));
    const homeFamilyP2HtmlRaw = normalizeText(formData.get("homeFamilyP2Html"));
    const homeFamilyP1Html = homeFamilyP1HtmlRaw
      ? sanitizeRichTextHtml(homeFamilyP1HtmlRaw)
      : "";
    const homeFamilyP2Html = homeFamilyP2HtmlRaw
      ? sanitizeRichTextHtml(homeFamilyP2HtmlRaw)
      : "";

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

    const homeTexts = {
      heroTitle: normalizeText(formData.get("homeHeroTitle")),
      heroSubtitle: normalizeText(formData.get("homeHeroSubtitle")),
      heroBadgeVisible,
      heroBadgeText,
      heroHighlights,
      familyTitle: normalizeText(formData.get("homeFamilyTitle")),
      familyP1: homeFamilyP1Html
        ? richHtmlToPlainText(homeFamilyP1Html)
        : normalizeText(formData.get("homeFamilyP1")),
      familyP2: homeFamilyP2Html
        ? richHtmlToPlainText(homeFamilyP2Html)
        : normalizeText(formData.get("homeFamilyP2")),
      familyP1Html: homeFamilyP1Html || undefined,
      familyP2Html: homeFamilyP2Html || undefined,
      catalogueTitle,
      catalogueIntro,
      catalogueItems,
    };

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

    // Bannière "site en construction"
    const bannerTextHtmlRaw = normalizeText(formData.get("bannerTextHtml"));
    const bannerTextHtml = bannerTextHtmlRaw
      ? sanitizeRichTextHtml(bannerTextHtmlRaw)
      : "";
    const banner = {
      isVisible: parseVisibleFlag(formData.get("bannerVisible")),
      text: bannerTextHtml
        ? richHtmlToPlainText(bannerTextHtml)
        : normalizeText(formData.get("bannerText")),
      textHtml: bannerTextHtml || undefined,
    };

    // Promo modal
    const promoImageSrc = normalizeText(formData.get("promoImageSrc"));
    const promoImageAlt = normalizeAlt(
      String(formData.get("promoImageAlt") ?? ""),
      "Photo promo"
    );
    const promoTextHtmlRaw = normalizeText(formData.get("promoTextHtml"));
    const promoTextHtml = promoTextHtmlRaw
      ? sanitizeRichTextHtml(promoTextHtmlRaw)
      : "";
    const promo = {
      isVisible: parseVisibleFlag(formData.get("promoVisible")),
      title: normalizeText(formData.get("promoTitle")),
      text: promoTextHtml
        ? richHtmlToPlainText(promoTextHtml)
        : normalizeText(formData.get("promoText")),
      textHtml: promoTextHtml,
      image: { src: promoImageSrc, alt: promoImageAlt },
    };

    // Home FAQ (section + questions)
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

    const faqItems = faqIds
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
      // garde-fou: ignore les lignes totalement vides
      .filter(
        (x) =>
          x.question.trim() || x.answer.trim() || (x.answerHtml ?? "").trim()
      );

    const faq = {
      isVisible: faqVisible,
      title: faqTitle,
      intro: faqIntro,
      introHtml: faqIntroHtml || undefined,
      items: faqItems,
    };

    // Contact — Informations
    const contactInfoTitle = normalizeText(formData.get("contactInfoTitle"));
    const contactInfoTextHtmlRaw = normalizeText(
      formData.get("contactInfoTextHtml")
    );
    const contactInfoTextHtml = contactInfoTextHtmlRaw
      ? sanitizeRichTextHtml(contactInfoTextHtmlRaw)
      : "";
    const contactInfo = {
      title: contactInfoTitle,
      text: contactInfoTextHtml
        ? richHtmlToPlainText(contactInfoTextHtml)
        : normalizeText(formData.get("contactInfoText")),
      textHtml: contactInfoTextHtml || undefined,
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
        where: { key: SITE_KEYS.homeProjects },
        create: {
          key: SITE_KEYS.homeProjects,
          value: { intervalMs: projectsIntervalMs, slides },
        },
        update: { value: { intervalMs: projectsIntervalMs, slides } },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeTexts },
        create: { key: SITE_KEYS.homeTexts, value: homeTexts },
        update: { value: homeTexts },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.aboutTexts },
        create: { key: SITE_KEYS.aboutTexts, value: aboutTexts },
        update: { value: aboutTexts },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.constructionBanner },
        create: { key: SITE_KEYS.constructionBanner, value: banner },
        update: { value: banner },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.promoModal },
        create: { key: SITE_KEYS.promoModal, value: promo },
        update: { value: promo },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.homeFaq },
        create: { key: SITE_KEYS.homeFaq, value: faq },
        update: { value: faq },
      }),
      prisma.siteSetting.upsert({
        where: { key: SITE_KEYS.contactInfo },
        create: { key: SITE_KEYS.contactInfo, value: contactInfo },
        update: { value: contactInfo },
      }),
    ]);

    // Invalide le cache des réglages "siteSettings" (utilisé dans le layout/public).
    revalidateTag("siteSettings", "default");

    // Home
    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/categories", "layout");
    revalidatePath("/produits", "layout");
    revalidatePath("/qui-sommes-nous");
    revalidatePath("/admin/home");

    return { ok: true as const, message: "Enregistré." };
  } catch (e: unknown) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? e.message : "Erreur lors de l’enregistrement.",
    };
  }
}
