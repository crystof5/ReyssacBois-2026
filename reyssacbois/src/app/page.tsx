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
import Container from "@/components/ui/Container";
import Media from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

export default async function Home() {
  const [
    family,
    aboutHistory,
    projects,
    homeTexts,
    aboutTexts,
    faq,
    contactInfo,
  ] = await Promise.all([
    getSiteImage(SITE_KEYS.homeFamily),
    getSiteImage(SITE_KEYS.aboutHistory),
    getProjectsCarouselSettings(),
    getHomeTexts(),
    getAboutTexts(),
    getHomeFaqSettings(),
    getContactInfoSettings(),
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
        className="relative flex items-center overflow-hidden scroll-mt-24 min-h-[68vh] bg-forest-800 sm:min-h-[80vh]"
      >
        {/* Image hero (pilotée par la DB via --rb-bg-image) portée par la section elle-même */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "var(--rb-bg-image)" }}
        />
        {/* Voile pour la lisibilité (plus dense à gauche où est le texte, plus clair à droite) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
        {/* Fondu doux vers la page (bas) — transition éclaircie, pas de coupe brutale */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent to-bg" />

        <Container className="relative z-10 w-full py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl">
            {heroBadgeVisible ? (
              <p className="rb-kicker text-white/90">{heroBadgeText}</p>
            ) : null}

            <h1 className="mt-5 font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg sm:text-xl leading-relaxed text-white/85">
              {heroSubtitle}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <ButtonLink href="/produits" variant="secondary">
                Aller au catalogue
                <span aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink href="/#contact" variant="ghost-dark">
                Demander un devis
              </ButtonLink>
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
              <div className="rb-surface overflow-hidden">
                <div className="aspect-[4/3] w-full">
                  <Media
                    src={familyImage.src}
                    alt={familyImage.alt}
                    className="h-full w-full"
                  />
                </div>
              </div>
              <div className="absolute -bottom-3 -right-2 border border-forest-800/40 bg-forest-800 px-4 py-3 text-white shadow-[var(--shadow-pop)] sm:-bottom-4 sm:-right-4">
                <p className="font-heading text-xl font-extrabold leading-none sm:text-2xl">
                  Depuis 1850
                </p>
                <p className="mt-1 text-xs text-white/85">Entreprise familiale</p>
              </div>
            </div>

            <div>
              <p className="rb-kicker">Reyssac Bois</p>
              <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl">
                {familyTitle}
              </h2>

              <div className="mt-5 space-y-4 text-ink-600">
                {familyP1Html ? (
                  <RichText html={familyP1Html} className="text-base sm:text-lg" />
                ) : (
                  <p className="text-base leading-relaxed sm:text-lg">
                    {familyP1Fallback}
                  </p>
                )}
                {familyP2Html ? (
                  <RichText html={familyP2Html} className="text-base sm:text-lg" />
                ) : (
                  <p className="text-base leading-relaxed sm:text-lg">
                    {familyP2Fallback}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge>Expertise</Badge>
                <Badge>Sur-mesure</Badge>
                <Badge>Conseil</Badge>
                <Badge>Livraison</Badge>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/#contact">
                  Nous contacter
                  <span aria-hidden="true">→</span>
                </ButtonLink>
                <ButtonLink href="/produits" variant="secondary">
                  Voir le catalogue
                  <span aria-hidden="true">↗</span>
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* PRODUITS */}
      <section id="catalogue" className="py-14 sm:py-20 scroll-mt-24">
        <Container>
          <SectionHeading
            align="center"
            kicker="Catalogue"
            title={catalogueTitle}
            intro={catalogueIntro}
          />

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

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/produits">
              Aller au catalogue
              <span aria-hidden="true">→</span>
            </ButtonLink>
            <ButtonLink href="/#contact" variant="secondary">
              Poser une question
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* QUI SOMMES-NOUS */}
      <section
        id="qui-sommes-nous"
        className="border-y border-line bg-surface-2 py-14 sm:py-20 scroll-mt-24"
      >
        <Container>
          <SectionHeading
            align="center"
            kicker="À propos"
            title={aboutPageTitle}
            intro="Une entreprise familiale, une expertise transmise, et une exigence de qualité au quotidien."
          />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="rb-surface p-6 sm:p-7">
              <h3 className="font-heading text-xl font-bold text-ink sm:text-2xl">
                {aboutHistoryTitle}
              </h3>
              {aboutHistoryTextHtml ? (
                <div className="mt-4">
                  <RichText
                    html={aboutHistoryTextHtml}
                    className="text-base text-ink-600 sm:text-lg"
                  />
                </div>
              ) : (
                <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
                  {aboutHistoryText}
                </p>
              )}

              <div className="mt-6 overflow-hidden rounded border border-line bg-surface-2">
                <div className="aspect-[4/3] w-full">
                  <Media
                    src={aboutHistoryImage.src}
                    alt={aboutHistoryImage.alt}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:space-y-8">
              <div className="rb-surface p-6 sm:p-7">
                <h3 className="font-heading text-xl font-bold text-ink sm:text-2xl">
                  {aboutMissionTitle}
                </h3>
                {aboutMissionTextHtml ? (
                  <div className="mt-4">
                    <RichText
                      html={aboutMissionTextHtml}
                      className="text-base text-ink-600 sm:text-lg"
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
                    {aboutMissionText}
                  </p>
                )}
              </div>

              <div className="rb-surface p-6 sm:p-7">
                <h3 className="font-heading text-xl font-bold text-ink sm:text-2xl">
                  {aboutLocationTitle}
                </h3>
                {aboutLocationTextHtml ? (
                  <div className="mt-4">
                    <RichText
                      html={aboutLocationTextHtml}
                      className="text-base text-ink-600 sm:text-lg"
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
                    {aboutLocationText}
                  </p>
                )}
              </div>

              <div className="rb-surface p-6 sm:p-7">
                {aboutConclusionTextHtml ? (
                  <RichText
                    html={aboutConclusionTextHtml}
                    className="text-center text-base text-ink sm:text-lg"
                  />
                ) : (
                  <p className="text-center text-base text-ink sm:text-lg">
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
            <div className="rb-surface p-6 sm:p-7">
              <SectionHeading
                align="center"
                kicker="FAQ"
                title={faqTitle}
                intro={
                  faqIntroHtml ? (
                    <RichText html={faqIntroHtml} />
                  ) : (
                    <span className="whitespace-pre-line">{faqIntroFallback}</span>
                  )
                }
              />

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
                <p className="mt-8 text-center text-sm text-ink-600">
                  La FAQ est activée, mais aucune question n’est visible.
                </p>
              )}

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink href="/#contact">
                  Poser une question
                  <span aria-hidden="true">→</span>
                </ButtonLink>
                <ButtonLink href="/produits" variant="secondary">
                  Voir le catalogue
                  <span aria-hidden="true">↗</span>
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* CONTACT */}
      <section id="contact" className="py-14 sm:py-20 scroll-mt-24">
        <Container>
          <SectionHeading
            align="center"
            kicker="Contact"
            title="Parlons de votre projet"
            intro="Disponibilité, devis, conseil, commande : décrivez votre besoin et nous vous répondons rapidement."
          />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="rb-surface p-6">
                <h3 className="text-base font-semibold text-ink">
                  {contactInfoTitle}
                </h3>
                <div className="mt-3 text-sm text-ink-600">
                  {contactInfoHtml ? (
                    <RichText html={contactInfoHtml} />
                  ) : (
                    <p className="whitespace-pre-line">{contactInfoText}</p>
                  )}
                </div>
              </div>

              <div className="rb-surface overflow-hidden p-0">
                <div className="relative w-full pt-[56.25%]">
                  <iframe
                    title="Carte - Reyssac Bois"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2861.0054045604797!2d0.6584004767006642!3d44.186355417784526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12abb381555554cf%3A0xa1fac795a72fef80!2sReyssac%20Bois!5e0!3m2!1sfr!2sfr!4v1693635316155!5m2!1sfr!2sfr"
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            <div className="rb-surface p-6">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      {/* NOS BOIS, VOS PROJETS (exemples / inspirations) */}
      <section id="projets" className="py-12 sm:py-16 scroll-mt-24">
        <Container>
          <div className="rb-surface p-6 sm:p-7">
            <SectionHeading
              align="center"
              kicker="Inspirations"
              title="Nos bois, vos projets"
              intro="Quelques exemples de réalisations avec nos bois — pour vous inspirer avant de demander un devis."
            />

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
  return <span className="rb-badge rb-badge-green">{children}</span>;
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
  const content = (
    <div className="p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-forest-050 text-forest-800 ring-1 ring-forest-700/15">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <rect x="3" y="5" width="18" height="3.4" />
          <rect x="3" y="10.3" width="18" height="3.4" />
          <rect x="3" y="15.6" width="13" height="3.4" />
        </svg>
      </div>
      <h3 className="mt-4 font-heading text-xl font-bold text-ink">{title}</h3>
      <p className="mt-2 leading-relaxed text-ink-600">{desc}</p>
      {href ? (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
          Découvrir
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="rb-card-interactive group">
        {content}
      </Link>
    );
  }

  return <div className="rb-card">{content}</div>;
}

function HeroPill({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-white/75">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a, isHtml }: { q: string; a: string; isHtml?: boolean }) {
  return (
    <details className="group rounded border border-line bg-surface shadow-sm transition-colors open:border-forest-700/40">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-5">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-forest-050 font-bold text-forest-800 ring-1 ring-forest-700/15">
          ?
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug text-ink sm:text-base">
            {q}
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Cliquer pour afficher la réponse
          </p>
        </div>
        <span
          className="ml-auto mt-1 inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line text-ink-600 transition group-open:rotate-45"
          aria-hidden
        >
          +
        </span>
      </summary>
      <div className="px-5 pb-5 pl-[3.75rem]">
        {isHtml ? (
          <RichText html={a} className="text-sm text-ink-600" />
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">
            {a}
          </p>
        )}
      </div>
    </details>
  );
}
