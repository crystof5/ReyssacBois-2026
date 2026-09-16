import Link from "next/link"
import { getFeaturedCategoryLinks } from "@/lib/featuredCategories"
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "@/lib/business"

export default async function SiteFooter({ children }: { children?: React.ReactNode }) {
  const featured = await getFeaturedCategoryLinks()

  return (
    <footer className="mt-8 border-t border-gray-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Identité + NAP */}
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/android-chrome-192x192.png"
                alt="Logo Reyssac Bois"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full bg-white shadow-sm ring-1 ring-black/5"
                loading="lazy"
              />
              <p className="text-sm font-semibold text-gray-900">{BUSINESS.name}</p>
            </div>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              Négoce et vente de bois depuis {BUSINESS.foundingYear}, à Boé aux portes d&apos;Agen.
            </p>
            <address className="mt-3 not-italic text-sm text-gray-700 leading-relaxed">
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener"
                className="hover:text-gray-900 hover:underline underline-offset-4"
              >
                {BUSINESS.address.street}
                <br />
                {BUSINESS.address.postalCode} {BUSINESS.address.city} – {BUSINESS.address.nearCity}
              </a>
              <br />
              <a
                href={`tel:${BUSINESS.phoneE164}`}
                className="font-medium text-gray-900 hover:underline underline-offset-4"
              >
                {BUSINESS.phoneDisplay}
              </a>
            </address>
            <nav aria-label="Services" className="mt-4">
              <ul className="space-y-1.5 text-sm text-gray-700">
                {[
                  { href: "/livraison-bois", label: "Livraison de bois" },
                  { href: "/decoupe-panneaux-sur-mesure", label: "Découpe de panneaux sur mesure" },
                  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
                  { href: "/contact", label: "Contact et accès" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-gray-900 hover:underline underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Horaires + zones */}
          <div className="text-sm text-gray-700 leading-relaxed">
            <p className="font-semibold text-gray-900">Horaires</p>
            <p className="mt-2">
              Lundi au vendredi
              <br />
              8h30–12h et 14h–18h
              <br />
              Fermé samedi et dimanche
            </p>
            <p className="mt-4 font-semibold text-gray-900">Livraison</p>
            <p className="mt-2">
              Agen et son agglomération, tout le Lot-et-Garonne (47), le Gers (32) et le
              Tarn-et-Garonne (82). De Bordeaux à Toulouse sur devis.
            </p>
          </div>

          {/* Produits phares */}
          {featured.length > 0 ? (
            <nav aria-label="Nos produits bois" className="sm:col-span-2">
              <p className="text-sm font-semibold text-gray-900">Nos produits bois à Agen</p>
              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-700">
                {featured.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={l.href}
                      className="hover:text-gray-900 hover:underline underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <p className="mt-8 text-xs text-gray-600 leading-relaxed">
          {BUSINESS.name}, magasin et négoce de bois à Boé ({BUSINESS.address.postalCode}), ancienne scierie familiale, accueille
          particuliers et professionnels de l&apos;agglomération d&apos;Agen (Le Passage, Bon-Encontre,
          Foulayronnes, Pont-du-Casse, Colayrac, Layrac, Estillac, Brax) : bois de charpente,
          contreplaqués et panneaux, bois de menuiserie, parquet, lambris, bardage, terrasses et
          quincaillerie. Débit sur liste, découpe de panneaux et fabrication sur mesure, livraison dans le
          Lot-et-Garonne et les départements voisins. Adresse : {BUSINESS_ADDRESS_ONE_LINE}.
        </p>

        <div className="mt-6 flex flex-col gap-4 border-t border-gray-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {children}
        </div>
      </div>
    </footer>
  )
}
