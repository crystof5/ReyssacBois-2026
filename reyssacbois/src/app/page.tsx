import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProjectsCarousel from "@/components/ProjectsCarousel";
import RichText from "@/components/ui/RichText";
import {
  getAboutTexts,
  getContactInfoSettings,
  getHomeFaqSettings,
  getHomeTexts,
  getProjectsCarouselSettings,
  getSiteImage,
  SITE_KEYS,
} from "@/admin/queries/siteSettings";
import ContactForm from "@/components/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import Container from "@/components/ui/Container";
import Media from "@/components/ui/Media";
import { getFeaturedCategoryLinks } from "@/lib/featuredCategories";

export default async function Home() {
  const [
    family,
    aboutHistory,
    projects,
    homeTexts,
    aboutTexts,
    faq,
    contactInfo,
    featuredLinks,
  ] = await Promise.all([
    getSiteImage(SITE_KEYS.homeFamily),
    getSiteImage(SITE_KEYS.aboutHistory),
    getProjectsCarouselSettings(),
    getHomeTexts(),
    getAboutTexts(),
    getHomeFaqSettings(),
    getContactInfoSettings(),
    getFeaturedCategoryLinks(),
  ]);

  // Fallbacks: utiliser un asset existant dans /public pour éviter des 404 si les settings ne sont pas encore remplis.
  const familyImage = family ?? {
    src: "/img/placeholder.svg",
    alt: "Reyssac Bois",
  };
  const aboutHistoryImage = aboutHistory ?? {
    src: "/img/placeholder.svg",
    alt: "Histoire Reyssac Bois",
  };
  const heroTitle = homeTexts?.heroTitle?.trim()
    ? homeTexts.heroTitle.trim()
    : "Reyssac Bois";
  const heroSubtitle = homeTexts?.heroSubtitle?.trim()
    ? homeTexts.heroSubtitle.trim()
    : "Votre expert en bois depuis 1850";
  const heroBadgeVisible = homeTexts?.heroBadgeVisible ?? true;
  const heroBadgeText = homeTexts?.heroBadgeText?.trim()
    ? homeTexts.heroBadgeText.trim()
    : "Bois • Quincaillerie • Conseil • Stock important";
  const heroHighlights = (
    homeTexts?.heroHighlights ?? [
      { isVisible: true, title: "Depuis 1850", desc: "Entreprise familiale" },
      { isVisible: true, title: "Conseil", desc: "Pro & particuliers" },
      { isVisible: true, title: "Stock", desc: "Disponibilité rapide" },
    ]
  ).filter((x) => x && x.isVisible && (x.title?.trim() || x.desc?.trim()));

  const catalogueTitle = homeTexts?.catalogueTitle?.trim()
    ? homeTexts.catalogueTitle.trim()
    : "Nos produits";
  const catalogueIntro = homeTexts?.catalogueIntro?.trim()
    ? homeTexts.catalogueIntro.trim()
    : "Construction, bardage, terrasse, quincaillerie… trouvez rapidement ce qu’il vous faut par catégories.";

  const catalogueSlots = (homeTexts?.catalogueItems ?? []).slice(0, 3).map((x) => {
    if (!x) return null;
    const id = typeof x.id === "string" ? x.id.trim() : "";
    if (!id) return null;
    return { kind: x.kind, id } as const;
  });

  const catalogueCategoryIds = catalogueSlots
    .filter((x) => x?.kind === "category")
    .map((x) => x!.id);
  const catalogueProductIds = catalogueSlots
    .filter((x) => x?.kind === "product")
    .map((x) => x!.id);

  const [catalogueCategories, catalogueProducts] = await Promise.all([
    catalogueCategoryIds.length
      ? prisma.category.findMany({
          where: { id: { in: catalogueCategoryIds }, isVisible: true },
          select: { id: true, name: true, slug: true, description: true },
        })
      : Promise.resolve([]),
    catalogueProductIds.length
      ? prisma.product.findMany({
          where: { id: { in: catalogueProductIds }, isVisible: true },
          select: { id: true, name: true, slug: true, description: true },
        })
      : Promise.resolve([]),
  ]);

  const catalogueById = new Map<
    string,
    {
      kind: "category" | "product";
      id: string;
      name: string;
      slug: string;
      description: string | null;
    }
  >();
  for (const c of catalogueCategories)
    catalogueById.set(c.id, { ...c, kind: "category" });
  for (const p of catalogueProducts)
    catalogueById.set(p.id, { ...p, kind: "product" });

  const catalogueCards = catalogueSlots
    .map((slot) => (slot ? catalogueById.get(slot.id) ?? null : null))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const contactInfoTitle = contactInfo?.title?.trim()
    ? contactInfo.title.trim()
    : "Informations";
  const contactInfoHtml = (contactInfo?.textHtml ?? "").trim();
  const contactInfoText = contactInfo?.text?.trim()
    ? contactInfo.text.trim()
    : "Téléphone : 05 53 96 15 97\nHoraires : Lun–Ven, 8h–18h";
  const familyTitle = homeTexts?.familyTitle?.trim()
    ? homeTexts.familyTitle.trim()
    : "Une histoire de famille";
  const familyP1Fallback = homeTexts?.familyP1?.trim()
    ? homeTexts.familyP1.trim()
    : "Implantée à Boé et Bon-Encontre, proche d'Agen, l'entreprise Reyssac Bois a vu le jour en 1850. Depuis, notre passion et notre expertise du bois se sont transmises de père en fils sur cinq générations.";
  const familyP2Fallback = homeTexts?.familyP2?.trim()
    ? homeTexts.familyP2.trim()
    : "Nos équipes sont prêtes à accueillir aussi bien les professionnels que les particuliers. Avec un stock important à disposition, nous nous efforçons de répondre à chaque demande avec précision.";
  const familyP1Html = (homeTexts?.familyP1Html ?? "").trim();
  const familyP2Html = (homeTexts?.familyP2Html ?? "").trim();

  const aboutPageTitle = aboutTexts?.pageTitle?.trim()
    ? aboutTexts.pageTitle.trim()
    : "Qui sommes-nous ?";
  const aboutHistoryTitle = aboutTexts?.historyTitle?.trim()
    ? aboutTexts.historyTitle.trim()
    : "Notre Histoire";
  const aboutHistoryTextHtml = (aboutTexts?.historyTextHtml ?? "").trim();
  const aboutHistoryText = aboutTexts?.historyText?.trim()
    ? aboutTexts.historyText.trim()
    : "L'histoire débute il y a plus de 170 ans. Jean Reyssac, l'arrière-arrière grand-père de Benoît, l'actuel gérant, crée la société Reyssac Bois en 1850.";
  const aboutMissionTitle = aboutTexts?.missionTitle?.trim()
    ? aboutTexts.missionTitle.trim()
    : "Notre Mission";
  const aboutMissionTextHtml = (aboutTexts?.missionTextHtml ?? "").trim();
  const aboutMissionText = aboutTexts?.missionText?.trim()
    ? aboutTexts.missionText.trim()
    : "Notre mission est principalement la satisfaction du client et sa fidélisation. Nous favorisons des produits d'origine française et certifiés PEFC.";
  const aboutLocationTitle = aboutTexts?.locationTitle?.trim()
    ? aboutTexts.locationTitle.trim()
    : "Notre Localisation & Projets Futurs";
  const aboutLocationTextHtml = (aboutTexts?.locationTextHtml ?? "").trim();
  const aboutLocationText = aboutTexts?.locationText?.trim()
    ? aboutTexts.locationText.trim()
    : "Notre localisation est une force, aux portes d'Agen et à mi-chemin entre Bordeaux et Toulouse, nous sommes au coeur du Sud-Ouest.";
  const aboutConclusionTextHtml = (aboutTexts?.conclusionTextHtml ?? "").trim();
  const aboutConclusionText = aboutTexts?.conclusionText?.trim()
    ? aboutTexts.conclusionText.trim()
    : "Hâte de vous recevoir dans nos locaux !";
  const projectsSlides = projects?.slides?.length
    ? projects.slides
    : [
        { src: "/img/placeholder.svg", alt: "Projet 1" },
        { src: "/img/placeholder.svg", alt: "Projet 2" },
        { src: "/img/placeholder.svg", alt: "Projet 3" },
      ];
  const projectsIntervalMs = projects?.intervalMs ?? 5000;

  const faqIsVisible = Boolean(faq?.isVisible);
  const faqTitle = faq?.title?.trim()
    ? faq.title.trim()
    : "Questions fréquentes (livraison, agglomération d’Agen, conseils)";
  const faqIntroHtml = (faq?.introHtml ?? "").trim();
  const faqIntroFallback = faq?.intro?.trim()
    ? faq.intro.trim()
    : "Livraison de bois dans l’agglomération d’Agen, accueil des particuliers et pros, conseil personnalisé… Voici les réponses aux questions les plus courantes.";
  const faqItems = (faq?.items ?? []).filter(
    (x) =>
      x &&
      x.isVisible &&
      (x.question?.trim() || x.answer?.trim() || (x.answerHtml ?? "").trim())
  );
  const faqLdJson =
    faqIsVisible && faqItems.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((it) => ({
            "@type": "Question",
            name: it.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: (it.answer ?? "").trim(),
            },
          })),
        }
      : null;

  return (
    <div className="min-h-screen">
      {/* ACCUEIL / HERO */}
      <section
        id="accueil"
        className="relative overflow-hidden scroll-mt-24 min-h-[58vh]"
      >
        {/* Le fond d'écran (photo hero DB) est désormais géré globalement via CSS var --rb-bg-image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_15%,rgba(34,197,94,0.20),transparent_60%)]" />

        <Container className="relative z-10 py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl rounded-3xl border border-white/10 bg-black/25 p-6 sm:p-8 backdrop-blur shadow-[0_18px_45px_-30px_rgba(0,0,0,0.9)]">
            {heroBadgeVisible ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/90 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_0_6px_rgba(34,197,94,0.15)]" />
                {heroBadgeText}
              </p>
            ) : null}

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              {heroTitle}
              <span className="mt-3 block text-lg sm:text-2xl font-semibold tracking-normal text-white/85">
                Négoce et vente de bois à Agen (Boé)
              </span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/90 leading-relaxed">
              {heroSubtitle}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/produits"
                className="rb-press inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-gray-900 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.85)] ring-1 ring-white/30 transition hover:-translate-y-0.5 hover:bg-white/95 hover:ring-white/50"
              >
                Aller au catalogue
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/#contact"
                className="rb-press inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 hover:border-white/35"
              >
                Demander un devis
                <span aria-hidden="true">✦</span>
              </Link>
            </div>

            {heroHighlights.length ? (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {heroHighlights.slice(0, 3).map((h, idx) => (
                  <HeroPill key={idx} title={h.title} desc={h.desc} />
                ))}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {/* PRÉSENTATION */}
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
                <div className="aspect-[4/3] w-full">
                  <Media
                    src={familyImage.src}
                    alt={familyImage.alt}
                    className="h-full w-full"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 rounded-2xl bg-green-700 px-4 py-3 text-white shadow-xl ring-1 ring-black/10">
                <p className="text-xl sm:text-2xl font-bold leading-none">
                  Depuis 1850
                </p>
                <p className="text-xs mt-1 text-white/90">
                  Entreprise familiale
                </p>
              </div>
            </div>

            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/35 p-6 sm:p-7 backdrop-blur shadow-sm ring-1 ring-black/5">
              <div>
                <p className="text-xs font-semibold tracking-wide text-green-800/90">
                  REYSSAC BOIS
                </p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                  {familyTitle}
                </h2>
              </div>

              <div className="space-y-4 text-gray-700">
                {familyP1Html ? (
                  <RichText
                    html={familyP1Html}
                    className="text-base sm:text-lg"
                  />
                ) : (
                  <p className="text-base sm:text-lg leading-relaxed">
                    {familyP1Fallback}
                  </p>
                )}
                {familyP2Html ? (
                  <RichText
                    html={familyP2Html}
                    className="text-base sm:text-lg"
                  />
                ) : (
                  <p className="text-base sm:text-lg leading-relaxed">
                    {familyP2Fallback}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <Badge>Expertise</Badge>
                <Badge>Sur-mesure</Badge>
                <Badge>Conseil</Badge>
                <Badge>Livraison</Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                >
                  Nous contacter
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/produits"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white/55 px-5 py-3 text-sm font-semibold text-gray-900 backdrop-blur transition hover:bg-white/65 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                >
                  Voir le catalogue
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* PRODUITS */}
      <section id="catalogue" className="py-14 sm:py-20 scroll-mt-24">
        <Container>
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-semibold tracking-wide text-green-800/90">
              CATALOGUE
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              {catalogueTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-700">
              {catalogueIntro}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {catalogueCards.length ? (
              catalogueCards
                .slice(0, 3)
                .map((it) => (
                  <TeaserCard
                    key={`${it.kind}:${it.id}`}
                    title={it.name}
                    desc={(it.description ?? "").trim() || "Découvrir"}
                    href={
                      it.kind === "category"
                        ? `/categories/${it.slug}`
                        : `/produits/${it.slug}`
                    }
                  />
                ))
            ) : (
              <>
                <TeaserCard
                  title="Bois de construction"
                  desc="Sections, longueurs, essences: des bases solides pour vos chantiers."
                  href="/produits"
                />
                <TeaserCard
                  title="Aménagement extérieur"
                  desc="Terrasse, bardage, clôture: du durable, du beau, du conseillé."
                  href="/produits"
                />
                <TeaserCard
                  title="Quincaillerie & traitement"
                  desc="Fixations, colles, saturateurs… le bon produit au bon usage."
                  href="/produits"
                />
              </>
            )}
          </div>

          {featuredLinks.length ? (
            <nav aria-label="Produits phares" className="mt-8 text-center">
              <h3 className="text-sm font-semibold text-gray-900">
                Nos produits phares à Agen et en Lot-et-Garonne
              </h3>
              <ul className="mt-3 flex flex-wrap justify-center gap-2">
                {featuredLinks.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={l.href}
                      className="rb-press inline-flex rounded-full border border-gray-200/80 bg-white/60 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-800 backdrop-blur transition hover:bg-white hover:text-green-800"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/produits"
              className="rb-press inline-flex items-center justify-center gap-2 rounded-full bg-green-700 text-white px-7 py-3 text-sm font-semibold hover:bg-green-800 transition shadow-lg"
            >
              Aller au catalogue
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/#contact"
              className="rb-press inline-flex items-center justify-center gap-2 rounded-full border border-gray-200/80 bg-white/55 px-7 py-3 text-sm font-semibold text-gray-900 backdrop-blur transition hover:bg-white/65 hover:border-gray-300"
            >
              Poser une question
              <span aria-hidden="true">✦</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* QUI SOMMES-NOUS */}
      <section
        id="qui-sommes-nous"
        className="py-14 sm:py-20 border-y border-white/10 bg-white/30 backdrop-blur scroll-mt-24"
      >
        <Container>
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-semibold tracking-wide text-green-800/90">
              À PROPOS
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              {aboutPageTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-700">
              Une entreprise familiale, une expertise transmise, et une exigence
              de qualité au quotidien.
            </p>
            <Link
              href="/qui-sommes-nous"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-800 hover:underline underline-offset-4"
            >
              Découvrir notre histoire depuis 1850 <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="rounded-3xl border border-white/20 bg-white/55 backdrop-blur shadow-sm ring-1 ring-black/5 p-6 sm:p-7">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {aboutHistoryTitle}
              </h3>
              {aboutHistoryTextHtml ? (
                <div className="mt-4">
                  <RichText
                    html={aboutHistoryTextHtml}
                    className="text-gray-700 text-base sm:text-lg"
                  />
                </div>
              ) : (
                <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                  {aboutHistoryText}
                </p>
              )}

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200/70 bg-white/50">
                <div className="aspect-[4/3] w-full">
                  <Media
                    src={aboutHistoryImage.src}
                    alt={aboutHistoryImage.alt}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/20 bg-white/55 backdrop-blur shadow-sm ring-1 ring-black/5 p-6 sm:p-7">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {aboutMissionTitle}
                </h3>
                {aboutMissionTextHtml ? (
                  <div className="mt-4">
                    <RichText
                      html={aboutMissionTextHtml}
                      className="text-gray-700 text-base sm:text-lg"
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                    {aboutMissionText}
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/55 backdrop-blur shadow-sm ring-1 ring-black/5 p-6 sm:p-7">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {aboutLocationTitle}
                </h3>
                {aboutLocationTextHtml ? (
                  <div className="mt-4">
                    <RichText
                      html={aboutLocationTextHtml}
                      className="text-gray-700 text-base sm:text-lg"
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                    {aboutLocationText}
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/55 backdrop-blur shadow-sm ring-1 ring-black/5 p-6 sm:p-7">
                {aboutConclusionTextHtml ? (
                  <RichText
                    html={aboutConclusionTextHtml}
                    className="text-gray-800 text-base sm:text-lg text-center"
                  />
                ) : (
                  <p className="text-gray-800 text-base sm:text-lg text-center">
                    {aboutConclusionText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {faqIsVisible ? (
        <section id="faq" className="py-14 sm:py-20 scroll-mt-24">
          {faqLdJson ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLdJson) }}
            />
          ) : null}

          <Container>
            <div className="rounded-3xl border border-white/15 bg-white/50 backdrop-blur p-6 sm:p-7 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-col items-center text-center">
                <p className="text-xs font-semibold tracking-wide text-green-800/90">
                  FAQ
                </p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                  {faqTitle}
                </h2>
                <div className="mt-3 max-w-2xl text-sm sm:text-base text-gray-700">
                  {faqIntroHtml ? (
                    <RichText html={faqIntroHtml} />
                  ) : (
                    <p className="whitespace-pre-line">{faqIntroFallback}</p>
                  )}
                </div>
              </div>

              {faqItems.length ? (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {faqItems.map((it) => (
                    <FaqItem
                      key={it.id}
                      q={it.question}
                      a={
                        (it.answerHtml ?? "").trim()
                          ? it.answerHtml ?? ""
                          : it.answer ?? ""
                      }
                      isHtml={Boolean((it.answerHtml ?? "").trim())}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-8 text-center text-sm text-gray-600">
                  La FAQ est activée, mais aucune question n’est visible.
                </p>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                >
                  Poser une question
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/produits"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white/55 px-5 py-3 text-sm font-semibold text-gray-900 backdrop-blur transition hover:bg-white/65 hover:border-gray-300"
                >
                  Voir le catalogue
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* CONTACT */}
      <section id="contact" className="py-14 sm:py-20 scroll-mt-24">
        <Container>
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-semibold tracking-wide text-green-800/90">
              CONTACT
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              Parlons de votre projet
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-700">
              Disponibilité, devis, conseil, commande: décrivez votre besoin et
              nous vous répondons rapidement.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200/70 bg-white/55 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
                <h3 className="text-base font-semibold text-gray-900">
                  {contactInfoTitle}
                </h3>
                <div className="mt-3 text-sm text-gray-700">
                  {contactInfoHtml ? (
                    <RichText html={contactInfoHtml} />
                  ) : (
                    <p className="whitespace-pre-line">{contactInfoText}</p>
                  )}
                </div>
              </div>

              <MapEmbed />
            </div>

            <div className="rounded-3xl border border-gray-200/70 bg-white/55 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      {/* NOS BOIS, VOS PROJETS (exemples / inspirations) */}
      <section id="projets" className="py-12 sm:py-16 scroll-mt-24">
        <Container>
          <div className="rounded-3xl border border-white/15 bg-white/35 backdrop-blur p-6 sm:p-7 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs font-semibold tracking-wide text-green-800/90">
                INSPIRATIONS
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                Nos bois, vos projets
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-700">
                Quelques exemples de réalisations avec nos bois — pour vous
                inspirer avant de demander un devis.
              </p>
            </div>

            <div className="mt-8">
              <ProjectsCarousel
                slides={projectsSlides}
                intervalMs={projectsIntervalMs}
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-green-700/10 bg-green-50/80 px-3 py-1 text-xs font-semibold text-green-900">
      {children}
    </span>
  );
}

function TeaserCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href?: string;
}) {
  const className =
    "group rb-depth-shadow rb-depth-hover block rounded-3xl border border-gray-200/70 bg-white/55 p-6 ring-1 ring-black/5 backdrop-blur hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/30";

  const content = (
    <>
      <div className="h-11 w-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-800 font-bold ring-1 ring-green-700/10 transition duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-green-700 group-hover:text-white">
        ✦
      </div>
      <h3 className="mt-4 text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-700 leading-relaxed">{desc}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function HeroPill({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-white/80">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a, isHtml }: { q: string; a: string; isHtml?: boolean }) {
  return (
    <details className="group rounded-2xl border border-gray-200/70 bg-white/55 backdrop-blur p-5 shadow-sm ring-1 ring-black/5 open:bg-white/65">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-800 font-bold ring-1 ring-green-700/10">
            ?
          </span>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
              {q}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Cliquer pour afficher la réponse
            </p>
          </div>
          <span
            className="ml-auto mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white/70 text-gray-700 transition group-open:rotate-45"
            aria-hidden
          >
            +
          </span>
        </div>
      </summary>
      <div className="mt-4 pl-10 pr-2">
        {isHtml ? (
          <RichText html={a} className="text-sm text-gray-700" />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {a}
          </p>
        )}
      </div>
    </details>
  );
}
