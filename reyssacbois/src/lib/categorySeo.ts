/**
 * SEO local des pages catégories (title, meta description, bloc texte "à Agen").
 *
 * - Les catégories phares ont un contenu rédigé (CATEGORY_SEO).
 * - Les autres reçoivent un contenu généré à partir de leur nom et de leur parent.
 *
 * Les textes ne citent que des produits présents au catalogue : à relire avec le client
 * avant d'ajouter une essence, une marque ou un service.
 */

import { buildDescription } from "@/lib/meta"

export type CategorySeo = {
  /** Sans le suffixe "| Reyssac Bois" (ajouté par le template du layout). */
  title: string
  description: string
  heading: string
  paragraphs: string[]
}

const LOCAL_SERVICES =
  "Retrait sur place à Boé, conseil au comptoir, découpe sur mesure et livraison dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne."

const CATEGORY_SEO: Record<string, Omit<CategorySeo, "paragraphs"> & { paragraphs: string[] }> = {
  contreplaques: {
    title: "Contreplaqué à Agen (Boé) – Peuplier, okoumé, bouleau",
    description:
      "Panneaux contreplaqués à Boé près d'Agen : peuplier WBP, okoumé CTBX, bouleau, anti-dérapant, bakélisé coffrage, cintrable. Découpe sur mesure et livraison 47, 32, 82.",
    heading: "Contreplaqué à Agen : stock, découpe et livraison",
    paragraphs: [
      "Reyssac Bois propose à Boé, aux portes d'Agen, une large gamme de panneaux contreplaqués pour les professionnels comme pour les particuliers : contreplaqué peuplier WBP, tout okoumé CTBX pour les usages extérieurs et humides, tout bouleau, bouleau anti-dérapant pour les planchers de véhicules et remorques, contreplaqué bakélisé pour le coffrage, contreplaqué cintrable fromager, épicéa rainuré et contreplaqué replaqué essence fine.",
      "Plusieurs épaisseurs et formats sont disponibles en stock. Nous découpons vos panneaux contreplaqués sur mesure dans notre atelier et livrons les chantiers d'Agen, du Lot-et-Garonne, du Gers et du Tarn-et-Garonne.",
    ],
  },
  panneaux: {
    title: "Panneaux bois à Agen – Contreplaqué, OSB, MDF, aggloméré",
    description:
      "Panneaux bois à Boé près d'Agen : contreplaqués, OSB 3, médium MDF, aggloméré, lamellé-collé, latté, compact, isolants. Découpe de panneaux sur mesure et livraison.",
    heading: "Panneaux bois à Agen et en Lot-et-Garonne",
    paragraphs: [
      "Contreplaqués, OSB 3, médium MDF (standard, hydrofuge, teinté dans la masse), aggloméré (standard, hydrofuge, mélaminé, replaqué), panneaux lamellé-collés chêne, hévéa et pin des landes, latté 3 plis, compact et isolants : Reyssac Bois stocke à Boé les panneaux bois utilisés en agencement, construction et rénovation.",
      "Notre service de découpe de panneaux sur mesure vous évite les chutes et le transport de grands formats.",
    ],
  },
  "osb-3": {
    title: "Panneaux OSB 3 à Agen – Dalles et panneaux",
    description:
      "OSB 3 à Boé près d'Agen : dalles de plancher et panneaux OSB en plusieurs épaisseurs. Stock, découpe et livraison dans le Lot-et-Garonne.",
    heading: "OSB 3 à Agen",
    paragraphs: [
      "Dalles OSB 3 bouvetées pour planchers et panneaux OSB 3 pour contreventement, doublage et aménagement : retrouvez-les en stock chez Reyssac Bois à Boé, près d'Agen.",
    ],
  },
  "medium-mdf": {
    title: "Médium MDF à Agen – Standard, hydrofuge, teinté",
    description:
      "Panneaux médium MDF à Boé près d'Agen : MDF standard, hydrofuge et teinté dans la masse. Découpe sur mesure et livraison en Lot-et-Garonne.",
    heading: "Médium MDF à Agen",
    paragraphs: [
      "Médium standard pour l'agencement et le mobilier, médium hydrofuge pour les pièces humides, médium teinté dans la masse pour les finitions décoratives : nos panneaux MDF sont disponibles à Boé et peuvent être découpés à vos cotes.",
    ],
  },
  agglomere: {
    title: "Panneaux aggloméré à Agen – Standard, hydrofuge, mélaminé",
    description:
      "Aggloméré à Boé près d'Agen : standard, hydrofuge, mélaminé et replaqué essence fine. Découpe de panneaux sur mesure et livraison.",
    heading: "Aggloméré à Agen",
    paragraphs: [
      "Aggloméré standard, hydrofuge pour les planchers et pièces humides, mélaminé blanc ou décor, replaqué essence fine : Reyssac Bois vous conseille le panneau adapté et le découpe sur mesure.",
    ],
  },
  "lamelle-colles": {
    title: "Panneaux lamellé-collés à Agen – Chêne, hévéa, pin",
    description:
      "Panneaux lamellé-collés à Boé près d'Agen : chêne, hévéa (plans de travail) et pin des landes (panneaux, tablettes). Découpe sur mesure.",
    heading: "Lamellé-collé à Agen",
    paragraphs: [
      "Panneaux lamellé-collés en chêne, hévéa et pin des landes, plans de travail et tablettes : des panneaux massifs pour l'agencement, le mobilier et la cuisine, disponibles à Boé.",
    ],
  },
  charpente: {
    title: "Bois de charpente à Agen – Poutres, chevrons, madriers",
    description:
      "Bois de charpente à Boé près d'Agen : sapin/épicéa du Jura, chêne, iroko. Poutres, poteaux, madriers, bastaings, solives, chevrons, voliges. Débit sur liste et livraison.",
    heading: "Bois de charpente à Agen et en Lot-et-Garonne",
    paragraphs: [
      "Reyssac Bois fournit les charpentiers, couvreurs, maçons et particuliers de l'agglomération d'Agen en bois de charpente : sapin/épicéa du Jura (poteaux, poutres, madriers, bastaings, solives, chevrons, liteaux, voliges, planches), chêne du Massif central et iroko pour les structures extérieures.",
      "Besoin d'autres sections ou d'essences comme le Douglas, le mélèze ou le châtaignier ? Nous réalisons le débit sur liste. Livraison sur chantier dans le Lot-et-Garonne, le Gers et le Tarn-et-Garonne.",
    ],
  },
  "sapin-epicea": {
    title: "Charpente sapin / épicéa à Agen",
    description:
      "Bois de charpente sapin/épicéa du Jura à Boé près d'Agen : poteaux, poutres, madriers, bastaings, solives, chevrons, liteaux, voliges. Stock et livraison.",
    heading: "Sapin / épicéa de charpente à Agen",
    paragraphs: [
      "Léger, résistant et facile à travailler, le sapin/épicéa du Jura est l'essence la plus utilisée en charpente. Toutes les sections courantes sont disponibles en stock à Boé.",
    ],
  },
  "poteaux-poutres": {
    title: "Poteaux et poutres bois à Agen",
    description:
      "Poteaux et poutres en bois de charpente à Boé près d'Agen : poutre 20x20 cm et autres sections sur liste. Conseil, stock et livraison sur chantier.",
    heading: "Poutres et poteaux bois à Agen",
    paragraphs: [
      "Poutres et poteaux en sapin/épicéa pour vos charpentes, pergolas, carports et structures. Autres sections, longueurs et essences (chêne, iroko, Douglas…) en débit sur liste.",
    ],
  },
  "madriers-bastaings": {
    title: "Madriers et bastaings à Agen",
    description:
      "Madriers 18x8 et 22x8 cm, bastaings 22x10 et 25x10 cm à Boé près d'Agen. Bois de structure en stock, livraison Lot-et-Garonne, Gers, Tarn-et-Garonne.",
    heading: "Madriers et bastaings à Agen",
    paragraphs: [
      "Madriers et bastaings en sapin/épicéa pour ossatures, planchers, solivages et coffrages : plusieurs sections en stock à Boé, livrables sur vos chantiers de l'agglomération d'Agen.",
    ],
  },
  "solives-solivettes": {
    title: "Solives et solivettes à Agen",
    description:
      "Solives bois 15x5 et 22x4 cm à Boé près d'Agen pour planchers et ossatures. Stock, conseil et livraison en Lot-et-Garonne.",
    heading: "Solives bois à Agen",
    paragraphs: [
      "Solives et solivettes en sapin/épicéa pour planchers et ossatures, disponibles à Boé. Nous vous aidons à choisir la section adaptée à votre portée.",
    ],
  },
  "chevrons-demi-chevrons": {
    title: "Chevrons et demi-chevrons à Agen",
    description:
      "Chevrons 6x8 et 11x10 cm, demi-chevrons 38x75 mm à Boé près d'Agen. Bois de charpente et couverture en stock, livraison sur chantier.",
    heading: "Chevrons bois à Agen",
    paragraphs: [
      "Chevrons et demi-chevrons en sapin/épicéa pour la charpente et la couverture, en stock à Boé et livrés dans l'agglomération d'Agen.",
    ],
  },
  "debit-sur-liste": {
    title: "Débit de bois sur liste à Agen – Scierie, Douglas, mélèze",
    description:
      "Débit de bois sur liste à Boé près d'Agen, héritier de la scierie Reyssac : sections et longueurs sur mesure, Douglas, mélèze, châtaignier. Devis sur demande.",
    heading: "Débit de bois sur liste à Agen",
    paragraphs: [
      "Vous cherchez une scierie près d'Agen pour faire débiter votre bois ? Reyssac Bois, scierie familiale jusqu'en 1970 et négoce depuis, fournit des sections et longueurs hors standard sur liste de débit.",
      "Envoyez-nous votre liste (sections, longueurs, quantités, essence : Douglas, mélèze, châtaignier, chêne…) : nous vous établissons un devis et préparons votre commande pour retrait à Boé ou livraison en Lot-et-Garonne, dans le Gers et le Tarn-et-Garonne.",
    ],
  },
  "bois-de-menuiserie-ebenisterie": {
    title: "Bois de menuiserie et d'ébénisterie à Agen",
    description:
      "Bois de menuiserie à Boé près d'Agen : chêne, châtaignier, frêne, hêtre, merisier, bois exotiques, sapin du Nord. Pour pros et particuliers.",
    heading: "Bois de menuiserie à Agen",
    paragraphs: [
      "Menuisiers, ébénistes, agenceurs et passionnés trouvent chez Reyssac Bois, à Boé, des bois de pays (chêne, châtaignier, frêne blanc, hêtre, pin sans nœud, tilleul, merisier, peuplier, érable sycomore, poirier), des bois exotiques et du sapin du Nord.",
      "Autres essences sur commande. Rabotage, collage et ponçage possibles dans notre atelier.",
    ],
  },
  exotiques: {
    title: "Bois exotiques à Agen – Iroko, méranti, niangon",
    description:
      "Bois exotiques à Boé près d'Agen : badi, fraké, iroko, méranti, niangon, keruing, framiré, ormeau. Pour menuiserie intérieure et extérieure.",
    heading: "Bois exotiques à Agen",
    paragraphs: [
      "Badi/bilinga, fraké/limba, iroko, méranti, niangon, keruing, framiré et ormeau : des bois denses et stables pour la menuiserie extérieure, les escaliers et l'agencement, disponibles à Boé près d'Agen.",
    ],
  },
  "sapin-du-nord": {
    title: "Sapin du Nord à Agen – Blanc et rouge",
    description:
      "Sapin du Nord blanc et rouge à Boé près d'Agen : résineux régulier pour menuiserie, lambris et agencement. Stock et conseil.",
    heading: "Sapin du Nord à Agen",
    paragraphs: [
      "Sapin du Nord blanc et rouge, un résineux régulier apprécié en menuiserie et en agencement, disponible chez Reyssac Bois à Boé.",
    ],
  },
  "bois-de-pays": {
    title: "Bois de pays à Agen – Chêne, châtaignier, hêtre",
    description:
      "Bois de pays à Boé près d'Agen : chêne, châtaignier, frêne blanc, hêtre, pin sans nœud, tilleul, merisier, peuplier, érable, poirier.",
    heading: "Bois de pays à Agen",
    paragraphs: [
      "Essences locales et françaises pour la menuiserie et l'ébénisterie : chêne, châtaignier, frêne blanc, hêtre, pin sans nœud, tilleul, merisier, peuplier, érable sycomore et poirier.",
    ],
  },
  "amenagements-exterieurs": {
    title: "Bois d'extérieur à Agen – Bardage, terrasse, clôture",
    description:
      "Aménagements extérieurs en bois à Boé près d'Agen : bardage, terrasses, rondins, piquets, clôtures, traverses paysagères, mobilier de jardin.",
    heading: "Bois d'aménagement extérieur à Agen",
    paragraphs: [
      "Bardage, terrasse bois, rondins et piquets traités, clôtures, traverses paysagères et mobilier de jardin : tout pour vos extérieurs, en stock à Boé et livré dans l'agglomération d'Agen.",
    ],
  },
  bardage: {
    title: "Bardage bois à Agen – Clin pin traité, volige épicéa",
    description:
      "Bardage bois à Boé près d'Agen : clin pin sylvestre traité CL4, volige épicéa traitée CL3, gamme Vivre en bois. Fixations inox et livraison.",
    heading: "Bardage bois à Agen",
    paragraphs: [
      "Clin en pin sylvestre traité classe 4, volige épicéa traitée classe 3 et gamme Vivre en bois, pour les façades, extensions et abris de jardin, en pose verticale ou horizontale. Pointes et vis inox disponibles au rayon quincaillerie.",
    ],
  },
  terrasses: {
    title: "Terrasse bois à Agen – Lames, structure, accessoires",
    description:
      "Terrasse bois à Boé près d'Agen : lames pin traité CL4, maçaranduba, bambou, structure, accessoires et produits d'entretien. Conseil et livraison.",
    heading: "Terrasse bois à Agen",
    paragraphs: [
      "Lames de terrasse en pin sylvestre traité classe 4, en bois exotique maçaranduba ou en bambou, structure, accessoires de pose et produits d'entretien : Reyssac Bois vous accompagne dans votre projet de terrasse bois autour d'Agen.",
    ],
  },
  "rondins-demi-rondins-piquets-clotures-traverses-paysageres": {
    title: "Rondins, piquets et clôtures bois à Agen",
    description:
      "Rondins et demi-rondins pin traité CL4, piquets appointés, traverses paysagères chêne à Boé près d'Agen. Pour clôtures et aménagements paysagers.",
    heading: "Rondins et piquets bois à Agen",
    paragraphs: [
      "Rondins pin traités classe 4 (dont pré-percés), demi-rondins, piquets ronds appointés et traverses paysagères en chêne pour vos clôtures, bordures et aménagements paysagers.",
    ],
  },
  parquet: {
    title: "Parquet bois à Agen – Chêne, pin des landes, massif",
    description:
      "Parquet massif et contrecollé à Boé près d'Agen : chêne, pin des landes, sapin du Nord, palapi. Pose clouée, vissée ou collée. Conseil et livraison.",
    heading: "Parquet bois à Agen",
    paragraphs: [
      "Parquets massifs et contrecollés en chêne, pin des landes, sapin du Nord blanc et palapi, pour le neuf comme pour la rénovation. Autres essences sur commande.",
    ],
  },
  lambris: {
    title: "Lambris bois à Agen – Pin des landes, sapin du Nord",
    description:
      "Lambris bois à Boé près d'Agen : pin des landes et sapin du Nord blanc pour murs et plafonds. Stock, conseil et livraison.",
    heading: "Lambris bois à Agen",
    paragraphs: [
      "Lambris en pin des landes et sapin du Nord blanc pour habiller murs et plafonds, en intérieur ou en extérieur sous abri.",
    ],
  },
  "planches-de-caissage-coffrage": {
    title: "Planches de coffrage à Agen – Pin, sapin / épicéa",
    description:
      "Planches de caissage et de coffrage à Boé près d'Agen : pin des landes et sapin/épicéa. Pour maçons, artisans et particuliers. Livraison chantier.",
    heading: "Planches de coffrage à Agen",
    paragraphs: [
      "Planches de caissage et de coffrage en pin des landes et sapin/épicéa pour la maçonnerie et les usages divers, livrables sur vos chantiers. Voir aussi notre contreplaqué bakélisé pour le coffrage.",
    ],
  },
  tasseaux: {
    title: "Tasseaux bois à Agen – Sapin du Nord",
    description:
      "Tasseaux en sapin du Nord blanc à Boé près d'Agen : sections 18x18 à 45x45 mm. Stock et conseil.",
    heading: "Tasseaux bois à Agen",
    paragraphs: [
      "Tasseaux en sapin du Nord blanc, de 18x18 à 45x45 mm, pour l'agencement, les ossatures légères et le bricolage.",
    ],
  },
  moulures: {
    title: "Moulures bois à Agen – Pin sans nœud",
    description:
      "Moulures bois à Boé près d'Agen : quart de rond, baguette d'angle, chambranle, encadrement, tourillon, crémaillère. Pin sans nœud en stock.",
    heading: "Moulures bois à Agen",
    paragraphs: [
      "Quarts de rond, chants plats, baguettes d'angle, encadrements, chambranles, tourillons, crémaillères et nez de cloison : moulures en pin sans nœud en stock, autres essences sur commande.",
    ],
  },
  plinthe: {
    title: "Plinthes bois à Agen",
    description:
      "Plinthes et surplinthes à Boé près d'Agen : médium pré-peint blanc, pin des landes, sapin du Nord blanc.",
    heading: "Plinthes bois à Agen",
    paragraphs: [
      "Plinthes et surplinthes en médium pré-peint blanc, pin des landes et sapin du Nord blanc pour des finitions soignées.",
    ],
  },
  "portes-blocs-portes": {
    title: "Portes et blocs-portes à Agen",
    description:
      "Portes intérieures et blocs-portes à Boé près d'Agen : alvéolaires, âme pleine, coupe-feu 30 ou 60 min, de 63 à 103 cm. Nombreuses références en stock.",
    heading: "Portes et blocs-portes à Agen",
    paragraphs: [
      "Portes seules et blocs-portes intérieurs alvéolaires, à âme pleine ou coupe-feu 30 et 60 minutes, en hauteur 204 cm et largeurs de 63 à 103 cm. De nombreuses références sont en stock à Boé.",
    ],
  },
  quincaillerie: {
    title: "Quincaillerie bois à Agen – Vis, sabots, équerres",
    description:
      "Quincaillerie pour le bois à Boé près d'Agen : vis bois et inox, pointes inox, sabots, équerres, pieds de poteaux, crampons, colles et produits de traitement.",
    heading: "Quincaillerie bois à Agen",
    paragraphs: [
      "Vis bois et inox, pointes inox pour bardage, sabots, équerres, pieds de poteaux, crampons bulldog, colles et produits de traitement : la quincaillerie pour réussir vos travaux bois.",
    ],
  },
  "fabrication-sur-mesure": {
    title: "Travail du bois sur mesure à Agen – Rabotage, découpe",
    description:
      "Atelier bois à Boé près d'Agen : rabotage, collage, ponçage, découpe de panneaux, débit sur liste et petits travaux de menuiserie sur mesure. Devis sur place.",
    heading: "Fabrication et travail du bois sur mesure à Agen",
    paragraphs: [
      "Héritier de la scierie familiale fondée à Boé, notre atelier réalise le travail à façon dont vous avez besoin : rabotage, collage, ponçage, découpe de panneaux à vos cotes, débit sur liste et petits travaux de menuiserie sur mesure.",
      "Venez nous présenter votre projet au dépôt, aux portes d'Agen : le devis se fait sur place, pour les particuliers comme pour les professionnels.",
    ],
  },
  "lames-a-volets": {
    title: "Lames à volets bois à Agen",
    description:
      "Lames à volets à Boé près d'Agen : sapin du Nord blanc et palapi. Pour la fabrication et la rénovation de volets bois.",
    heading: "Lames à volets à Agen",
    paragraphs: [
      "Lames à volets en sapin du Nord blanc et en palapi, pour fabriquer ou rénover vos volets bois.",
    ],
  },
}

type Crumb = { name: string; description?: string | null }

/**
 * @param path chemin complet de la catégorie (racine → feuille)
 */
export function getCategorySeo(slug: string, path: Crumb[]): CategorySeo {
  const category = path[path.length - 1]
  const parent = path.length > 1 ? path[path.length - 2] : null

  const custom = CATEGORY_SEO[slug]
  if (custom) {
    return { ...custom, paragraphs: [...custom.paragraphs, LOCAL_SERVICES] }
  }

  // Sous-catégories profondes aux noms génériques ("Panneaux", "Lames", "Structure"…) :
  // on ajoute le parent pour des titres uniques.
  const label = path.length >= 3 && parent ? `${category.name} – ${parent.name}` : category.name
  const lower = label.charAt(0).toLowerCase() + label.slice(1)

  return {
    title: `${label} à Agen`,
    description: buildDescription(
      `${label} chez Reyssac Bois à Boé, près d'Agen. ${category.description ?? ""}`,
      "",
    ),
    heading: `${label} à Agen et en Lot-et-Garonne`,
    paragraphs: [
      `Reyssac Bois, négociant en bois depuis 1850 à Boé, aux portes d'Agen, vous propose ${lower} pour vos projets, que vous soyez professionnel ou particulier.`,
      LOCAL_SERVICES,
    ],
  }
}

/** Catégories au contenu rédigé (utilisé par /llms.txt). */
export function listCustomCategorySeo() {
  return Object.entries(CATEGORY_SEO).map(([slug, seo]) => ({ slug, title: seo.title, description: seo.description }))
}
