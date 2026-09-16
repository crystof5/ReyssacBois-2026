/**
 * Identité de l'établissement (NAP : Name / Address / Phone).
 *
 * Source unique pour le footer, le JSON-LD LocalBusiness et les textes SEO locaux.
 * Doit rester STRICTEMENT identique à la fiche Google Business Profile.
 */

export const BUSINESS = {
  name: "Reyssac Bois",
  legalName: "REYSSAC BOIS",
  foundingYear: 1850,
  phoneDisplay: "05 53 96 15 97",
  phoneE164: "+33553961597",
  address: {
    street: "1250 Avenue du Docteur Jean Noguès",
    postalCode: "47550",
    city: "Boé",
    nearCity: "Agen",
    department: "Lot-et-Garonne",
    region: "Nouvelle-Aquitaine",
    country: "FR",
  },
  // Base Adresse Nationale (api-adresse.data.gouv.fr) — 1250 Av Dr Jean Nogues 47550 Boé
  geo: { latitude: 44.186545, longitude: 0.66127 },
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    slots: [
      { opens: "08:30", closes: "12:00" },
      { opens: "14:00", closes: "18:00" },
    ],
    display: "Du lundi au vendredi : 8h30–12h et 14h–18h",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Reyssac+Bois+1250+Avenue+du+Docteur+Jean+Nogu%C3%A8s+47550+Bo%C3%A9",
} as const

/** Zone prioritaire : Agen, son agglomération et ses alentours. */
export const AGEN_AREA_CITIES = [
  "Agen",
  "Boé",
  "Le Passage",
  "Bon-Encontre",
  "Foulayronnes",
  "Pont-du-Casse",
  "Colayrac-Saint-Cirq",
  "Layrac",
  "Estillac",
  "Brax",
  "Roquefort",
  "Castelculier",
  "Sainte-Colombe-en-Bruilhois",
  "Astaffort",
  "Laplume",
  "Port-Sainte-Marie",
] as const

/** Départements livrés régulièrement. */
export const DELIVERY_DEPARTMENTS = [
  { name: "Lot-et-Garonne", code: "47" },
  { name: "Gers", code: "32" },
  { name: "Tarn-et-Garonne", code: "82" },
] as const

/** Livraisons plus lointaines, sur devis (axe Bordeaux – Toulouse). */
export const EXTENDED_DELIVERY_CITIES = [
  "Villeneuve-sur-Lot",
  "Marmande",
  "Nérac",
  "Montauban",
  "Auch",
  "Bordeaux",
  "Toulouse",
] as const

export const BUSINESS_ADDRESS_ONE_LINE = `${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}`

/** Accroche locale réutilisée dans les titres / descriptions. */
export const LOCAL_TAGLINE = "à Boé, près d'Agen (Lot-et-Garonne)"
