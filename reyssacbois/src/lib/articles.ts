/**
 * Contenu PAR DÉFAUT de la rubrique "Conseils" (utilisé tant que l'admin n'a rien enregistré).
 * Les guides sont ensuite éditables dans l'admin (voir src/lib/editorial.ts).
 */

export type ArticleSection = {
  heading: string
  paragraphs: string[]
  list?: string[]
}

export type LegacyArticle = {
  slug: string
  title: string
  /** <title> sans le suffixe "| Reyssac Bois" */
  metaTitle: string
  description: string
  excerpt: string
  publishedAt: string
  intro: string
  sections: ArticleSection[]
  faq: { question: string; answer: string }[]
  /** Catégories du catalogue liées (slug + libellé). */
  related: { slug: string; label: string }[]
}

export const LEGACY_ARTICLES: LegacyArticle[] = [
  {
    slug: "quel-contreplaque-choisir",
    title: "Quel contreplaqué choisir : peuplier, okoumé, bouleau ?",
    metaTitle: "Quel contreplaqué choisir ? Peuplier, okoumé, bouleau",
    description:
      "Peuplier, okoumé CTBX, bouleau, bakélisé, cintrable : comment choisir le bon contreplaqué selon l'usage, l'humidité et la résistance. Conseils de Reyssac Bois à Agen.",
    excerpt:
      "Intérieur ou extérieur, agencement, plancher ou coffrage : les critères pour choisir la bonne essence et le bon collage.",
    publishedAt: "2026-09-16",
    intro:
      "Le contreplaqué est un panneau formé de fines feuilles de bois (les plis) collées à fils croisés. Ce croisement lui donne sa stabilité. Mais tous les contreplaqués ne se valent pas : l'essence, le nombre de plis et surtout le type de collage déterminent l'usage possible.",
    sections: [
      {
        heading: "1. Regarder d'abord le collage : intérieur ou extérieur",
        paragraphs: [
          "Le collage conditionne la tenue à l'humidité. La norme européenne EN 314-2 distingue trois classes : la classe 1 pour un usage intérieur sec, la classe 2 pour un milieu humide ou extérieur abrité, et la classe 3 pour l'extérieur.",
          "Les appellations « WBP » et « CTB-X » désignent des contreplaqués à collage résistant à l'humidité, destinés aux milieux humides et aux usages extérieurs. Un collage adapté ne dispense pas de protéger les chants et la surface du panneau.",
        ],
      },
      {
        heading: "2. Choisir l'essence selon l'usage",
        paragraphs: ["Chaque essence a ses points forts :"],
        list: [
          "Peuplier : léger, facile à travailler et économique. Idéal pour l'agencement, le mobilier et le doublage. En version WBP, il tolère les ambiances humides.",
          "Okoumé : léger et régulier. Le tout okoumé CTBX est apprécié pour les usages extérieurs et humides.",
          "Bouleau : dense, dur et très résistant grâce à ses nombreux plis fins. Parfait pour le mobilier, les étagères chargées et les ouvrages qui doivent durer.",
          "Épicéa rainuré : un aspect décoratif pour habiller murs et plafonds.",
          "Replaqué essence fine : un parement noble pour les meubles et l'agencement visible.",
        ],
      },
      {
        heading: "3. Les contreplaqués techniques",
        paragraphs: ["Pour certains usages, mieux vaut un panneau spécifique :"],
        list: [
          "Anti-dérapant (bouleau) : une face à relief pour les planchers de remorques, de véhicules utilitaires ou les zones de passage.",
          "Bakélisé (filmé) : une surface lisse et résistante pour le coffrage du béton, réutilisable plusieurs fois.",
          "Cintrable (fromager) : un panneau souple qui se courbe pour les formes arrondies en agencement.",
        ],
      },
      {
        heading: "4. Épaisseur et format",
        paragraphs: [
          "L'épaisseur dépend de la portée et de la charge : un habillage mural se contente de quelques millimètres, alors qu'un plancher ou une étagère chargée demande un panneau épais. Les formats courants tournent autour de 2500 × 1220 mm, avec des variantes selon les essences.",
          "Chez Reyssac Bois, à Boé près d'Agen, nous découpons vos panneaux sur mesure : vous repartez avec des pièces prêtes à poser.",
        ],
      },
    ],
    faq: [
      {
        question: "Quel contreplaqué pour l'extérieur ?",
        answer:
          "Choisissez un contreplaqué à collage extérieur, comme le tout okoumé CTBX, et protégez les chants et la surface avec une finition adaptée.",
      },
      {
        question: "Quel contreplaqué pour un plancher de remorque ?",
        answer:
          "Le contreplaqué bouleau anti-dérapant est conçu pour cet usage : il est dense, résistant et sa face à relief limite les glissades.",
      },
      {
        question: "Peut-on faire découper un contreplaqué ?",
        answer:
          "Oui, Reyssac Bois découpe les panneaux contreplaqués sur mesure dans son atelier de Boé, près d'Agen.",
      },
    ],
    related: [
      { slug: "contreplaques", label: "Nos contreplaqués" },
      { slug: "panneaux", label: "Tous les panneaux bois" },
    ],
  },
  {
    slug: "bastaing-madrier-chevron-solive-differences",
    title: "Bastaing, madrier, chevron, solive : quelles différences ?",
    metaTitle: "Bastaing, madrier, chevron, solive : les différences",
    description:
      "Poutre, poteau, madrier, bastaing, solive, chevron, liteau, volige : à quoi sert chaque bois de charpente et comment le choisir. Guide Reyssac Bois, Agen.",
    excerpt:
      "Le vocabulaire de la charpente expliqué simplement, avec les sections disponibles à notre dépôt.",
    publishedAt: "2026-09-16",
    intro:
      "Poutre, madrier, bastaing, solive, chevron… Ces noms désignent des pièces de bois de structure qui se distinguent par leur section (épaisseur × largeur) et par leur rôle dans l'ouvrage. Les appellations et les sections exactes varient selon les régions et les fournisseurs : l'essentiel est de choisir la bonne pièce pour la bonne fonction.",
    sections: [
      {
        heading: "Les pièces porteuses : poutres et poteaux",
        paragraphs: [
          "La poutre est une pièce horizontale qui reprend les charges et les transmet aux appuis. Le poteau est une pièce verticale qui porte la structure. Ce sont les plus grosses sections de la charpente, utilisées pour les charpentes, pergolas, carports et auvents. Nous proposons par exemple des poutres de 20 × 20 cm.",
        ],
      },
      {
        heading: "Madriers et bastaings",
        paragraphs: [
          "Madriers et bastaings sont des pièces épaisses et larges, utilisées pour les planchers, les ossatures, les linteaux, les solivages ou les coffrages lourds. Au dépôt de Boé, nous proposons des madriers de 18 × 8 et 22 × 8 cm et des bastaings de 22 × 10 et 25 × 10 cm.",
        ],
      },
      {
        heading: "Solives et solivettes",
        paragraphs: [
          "Les solives sont posées horizontalement et parallèlement pour porter un plancher. Leur section dépend de la portée (la distance entre appuis) et de l'écartement entre les solives. Nous proposons notamment des solives de 15 × 5 et 22 × 4 cm.",
        ],
      },
      {
        heading: "Chevrons, liteaux et voliges : la couverture",
        paragraphs: ["Ces pièces supportent la toiture :"],
        list: [
          "Chevrons : posés dans le sens de la pente, ils portent la couverture (par exemple 6 × 8 cm, 11 × 10 cm, demi-chevrons 38 × 75 mm).",
          "Liteaux et demi-liteaux : fixés sur les chevrons, ils servent à accrocher les tuiles.",
          "Voliges : des planches minces qui forment un support continu sous la couverture (épicéa, pin des landes, cèdre).",
        ],
      },
      {
        heading: "Quelle essence pour la charpente ?",
        paragraphs: [
          "Le sapin/épicéa, léger et résistant, est l'essence la plus utilisée ; le nôtre provient du Jura. Pour les charpentes apparentes ou de caractère, le chêne est un bois noble et durable. Pour les structures extérieures exposées, l'iroko offre une excellente durabilité.",
          "Besoin d'une section ou d'une essence hors stock, comme le Douglas ou le mélèze ? Nous réalisons le débit sur liste. Pour le dimensionnement d'une structure, faites toujours valider les sections par un professionnel (charpentier, bureau d'études).",
        ],
      },
    ],
    faq: [
      {
        question: "Quelle est la différence entre un madrier et un bastaing ?",
        answer:
          "Ce sont deux pièces épaisses et larges de bois de structure ; leurs sections varient selon les fournisseurs. Chez Reyssac Bois : madriers 18 × 8 et 22 × 8 cm, bastaings 22 × 10 et 25 × 10 cm.",
      },
      {
        question: "Quel bois utiliser pour une pergola ?",
        answer:
          "Des poteaux et des poutres en bois de charpente, idéalement traités pour l'extérieur ou dans une essence durable comme le chêne ou l'iroko.",
      },
      {
        question: "Proposez-vous d'autres sections que celles en stock ?",
        answer: "Oui, nous réalisons le débit sur liste : envoyez-nous vos sections, longueurs et quantités.",
      },
    ],
    related: [
      { slug: "charpente", label: "Bois de charpente" },
      { slug: "madriers-bastaings", label: "Madriers et bastaings" },
      { slug: "poteaux-poutres", label: "Poteaux et poutres" },
      { slug: "chevrons-demi-chevrons", label: "Chevrons" },
      { slug: "debit-sur-liste", label: "Débit sur liste" },
    ],
  },
  {
    slug: "quel-bois-pour-une-terrasse",
    title: "Quel bois choisir pour une terrasse dans le Sud-Ouest ?",
    metaTitle: "Quel bois pour une terrasse ? Pin traité, exotique, bambou",
    description:
      "Pin traité classe 4, bois exotique ou bambou : comment choisir ses lames de terrasse, la structure et l'entretien. Conseils de Reyssac Bois près d'Agen.",
    excerpt: "Lames, structure, fixations et entretien : les bons choix pour une terrasse qui dure.",
    publishedAt: "2026-09-16",
    intro:
      "Une terrasse en bois subit le soleil, la pluie et l'humidité du sol. Dans le Sud-Ouest, les étés chauds et les hivers humides mettent le bois à rude épreuve. Le choix des lames compte, mais la structure et la ventilation sont tout aussi importantes.",
    sections: [
      {
        heading: "Les lames : trois grandes familles",
        paragraphs: ["Voici les options que nous proposons :"],
        list: [
          "Pin sylvestre traité classe 4 : le traitement autoclave lui permet de résister à l'humidité et au contact du sol. C'est la solution la plus économique.",
          "Bois exotique (maçaranduba) : très dense et naturellement durable, sans traitement. Plus cher, il offre une grande longévité.",
          "Bambou : un matériau dense et stable, à l'aspect contemporain.",
        ],
      },
      {
        heading: "La structure : la base d'une terrasse durable",
        paragraphs: [
          "Les lames reposent sur des lambourdes, elles-mêmes posées sur des plots ou une dalle. La structure doit être au moins aussi durable que les lames : bois traité classe 4 ou essence durable.",
          "L'écartement des lambourdes dépend de l'épaisseur des lames. Prévoyez une légère pente pour l'écoulement de l'eau, une bonne ventilation sous la terrasse et un jeu de quelques millimètres entre les lames pour permettre au bois de travailler.",
        ],
      },
      {
        heading: "Fixations et accessoires",
        paragraphs: [
          "Utilisez des vis inox, adaptées à l'extérieur et aux bois tanniques, pour éviter les coulures noires. Nous proposons aussi les accessoires de pose de terrasse au dépôt de Boé.",
        ],
      },
      {
        heading: "L'entretien",
        paragraphs: [
          "Sans entretien, le bois grise naturellement sous l'effet des UV, sans perdre sa solidité. Pour conserver sa teinte, appliquez un saturateur ou une huile pour terrasse une à deux fois par an, sur un bois propre et sec.",
        ],
      },
    ],
    faq: [
      {
        question: "Quel est le bois de terrasse le moins cher ?",
        answer:
          "Le pin sylvestre traité autoclave classe 4 est généralement la solution la plus économique, tout en étant adapté à l'extérieur.",
      },
      {
        question: "Faut-il traiter une terrasse en bois exotique ?",
        answer:
          "Ce n'est pas indispensable pour sa durabilité, mais un saturateur permet de conserver sa couleur d'origine.",
      },
      {
        question: "Livrez-vous le bois de terrasse ?",
        answer:
          "Oui, dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne, et plus loin sur devis.",
      },
    ],
    related: [
      { slug: "terrasses", label: "Terrasses bois" },
      { slug: "lames", label: "Lames de terrasse" },
      { slug: "structure", label: "Structure de terrasse" },
      { slug: "entretien", label: "Entretien de terrasse" },
    ],
  },
  {
    slug: "bardage-bois-quelle-essence",
    title: "Bardage bois : quelle essence et quelle pose choisir ?",
    metaTitle: "Bardage bois : quelle essence et quelle pose choisir ?",
    description:
      "Clin pin traité classe 4, volige épicéa classe 3, pose verticale ou horizontale, fixations inox : bien choisir son bardage bois. Conseils Reyssac Bois, Agen.",
    excerpt: "Essences, traitements, sens de pose et fixations pour un bardage durable.",
    publishedAt: "2026-09-16",
    intro:
      "Le bardage bois habille les façades, les extensions et les abris de jardin. Pour qu'il dure, il faut choisir un bois adapté à l'exposition, soigner la ventilation et utiliser les bonnes fixations.",
    sections: [
      {
        heading: "Les essences et traitements proposés",
        paragraphs: ["Chez Reyssac Bois, nous proposons :"],
        list: [
          "Clin en pin sylvestre traité classe 4 : une protection renforcée pour les façades exposées.",
          "Volige en épicéa traitée classe 3 : pour l'extérieur sans contact avec le sol, par exemple les abris et les pignons.",
          "La gamme Vivre en bois, ainsi que d'autres essences sur commande.",
        ],
      },
      {
        heading: "Pose verticale ou horizontale ?",
        paragraphs: [
          "La pose horizontale, en clin, est la plus classique : les lames se recouvrent pour évacuer l'eau. La pose verticale allonge visuellement la façade et facilite l'écoulement de l'eau le long des lames. Dans les deux cas, le sens des lames détermine l'orientation des tasseaux de support.",
        ],
      },
      {
        heading: "Ventilation et fixations",
        paragraphs: [
          "Un bardage se pose sur une ossature de tasseaux qui crée une lame d'air ventilée entre le mur et le bois. Cette ventilation évite l'humidité et prolonge la durée de vie du bardage.",
          "Utilisez des pointes ou des vis inox : elles ne rouillent pas et ne tachent pas le bois. Nous proposons des pointes inox A2 adaptées à tous les types de bardage.",
        ],
      },
      {
        heading: "Vieillissement et finition",
        paragraphs: [
          "Laissé brut, le bois prend une teinte grise argentée avec le temps. Pour conserver la teinte d'origine, appliquez une finition extérieure adaptée et renouvelez-la régulièrement.",
        ],
      },
    ],
    faq: [
      {
        question: "Quelle classe de traitement pour un bardage ?",
        answer:
          "Un bardage extérieur sans contact avec le sol relève au minimum de la classe 3 ; la classe 4 apporte une protection renforcée.",
      },
      {
        question: "Quelles fixations pour un bardage bois ?",
        answer: "Des pointes ou des vis inox, qui ne rouillent pas et ne tachent pas le bois.",
      },
    ],
    related: [
      { slug: "bardage", label: "Bardage bois" },
      { slug: "pointes-inox-a2", label: "Pointes inox A2" },
      { slug: "tasseaux", label: "Tasseaux" },
    ],
  },
  {
    slug: "classes-emploi-bois-traitement",
    title: "Classes d'emploi du bois (CL2, CL3, CL4) : comment choisir ?",
    metaTitle: "Classes d'emploi du bois CL2, CL3, CL4 : comment choisir ?",
    description:
      "Classe 1 à 5 : comprendre les classes d'emploi du bois (norme EN 335) pour choisir un bois traité adapté à la charpente, au bardage ou à la terrasse.",
    excerpt: "Intérieur, extérieur, contact avec le sol : à chaque usage sa classe d'emploi.",
    publishedAt: "2026-09-16",
    intro:
      "Les classes d'emploi, définies par la norme européenne EN 335, décrivent le niveau d'exposition d'un bois à l'humidité. Elles indiquent le niveau de durabilité ou de traitement nécessaire pour qu'un bois tienne dans le temps.",
    sections: [
      {
        heading: "Les 5 classes d'emploi",
        paragraphs: ["De la plus protégée à la plus exposée :"],
        list: [
          "Classe 1 : intérieur sec (meubles, parquets, lambris intérieurs).",
          "Classe 2 : intérieur ou extérieur abrité, avec un risque d'humidification occasionnelle (charpentes, ossatures).",
          "Classe 3 : extérieur sans contact avec le sol, soumis aux intempéries (bardages, menuiseries extérieures).",
          "Classe 4 : extérieur en contact avec le sol ou l'eau douce (terrasses, poteaux, piquets, clôtures).",
          "Classe 5 : contact avec l'eau de mer.",
        ],
      },
      {
        heading: "Durabilité naturelle ou traitement",
        paragraphs: [
          "Certaines essences sont naturellement durables, comme le maçaranduba ou l'iroko. D'autres, comme le pin ou l'épicéa, reçoivent un traitement (souvent par autoclave) pour atteindre la classe voulue.",
          "Au dépôt, vous trouverez par exemple du bois de charpente traité classe 2, de la volige épicéa classe 3 et du pin sylvestre classe 4 pour les terrasses, bardages, rondins et piquets.",
        ],
      },
      {
        heading: "Comment choisir ?",
        paragraphs: [
          "Identifiez l'exposition réelle de l'ouvrage : abrité ou non, en contact avec le sol ou non, avec de l'eau stagnante ou non. En cas de doute, choisissez la classe supérieure. Après une coupe, protégez les extrémités d'un bois traité avec un produit de traitement adapté.",
        ],
      },
    ],
    faq: [
      {
        question: "Quelle classe pour des piquets de clôture ?",
        answer:
          "La classe 4, car les piquets sont en contact avec le sol. Nous proposons des piquets et rondins en pin traité classe 4.",
      },
      {
        question: "Quelle classe pour une charpente ?",
        answer: "Une charpente abritée relève généralement de la classe 2.",
      },
    ],
    related: [
      { slug: "amenagements-exterieurs", label: "Aménagements extérieurs" },
      { slug: "rondins-demi-rondins-piquets-clotures-traverses-paysageres", label: "Rondins et piquets" },
      { slug: "produits-de-traitement", label: "Produits de traitement" },
    ],
  },
]

/** Guide conseillé pour une catégorie du catalogue. */
export const CATEGORY_TO_ARTICLE: Record<string, string> = {
  contreplaques: "quel-contreplaque-choisir",
  panneaux: "quel-contreplaque-choisir",
  charpente: "bastaing-madrier-chevron-solive-differences",
  "sapin-epicea": "bastaing-madrier-chevron-solive-differences",
  "poteaux-poutres": "bastaing-madrier-chevron-solive-differences",
  "madriers-bastaings": "bastaing-madrier-chevron-solive-differences",
  "solives-solivettes": "bastaing-madrier-chevron-solive-differences",
  "chevrons-demi-chevrons": "bastaing-madrier-chevron-solive-differences",
  voliges: "bastaing-madrier-chevron-solive-differences",
  terrasses: "quel-bois-pour-une-terrasse",
  lames: "quel-bois-pour-une-terrasse",
  structure: "quel-bois-pour-une-terrasse",
  bardage: "bardage-bois-quelle-essence",
  "amenagements-exterieurs": "classes-emploi-bois-traitement",
  "rondins-demi-rondins-piquets-clotures-traverses-paysageres": "classes-emploi-bois-traitement",
  "produits-de-traitement": "classes-emploi-bois-traitement",
}
