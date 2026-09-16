import Link from "next/link"
import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import ContactForm from "@/components/ContactForm"
import MapEmbed from "@/components/MapEmbed"
import PageHeader, { PageCard } from "@/components/pages/PageHeader"
import { JsonLd, BUSINESS_ID } from "@/components/JsonLd"
import { BUSINESS } from "@/lib/business"
import { absoluteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Contact et accès – Reyssac Bois à Boé, près d'Agen",
  description:
    "Contactez Reyssac Bois, négoce de bois à Boé près d'Agen : 05 53 96 15 97, 1250 Avenue du Docteur Jean Noguès. Devis, conseil, horaires et itinéraire.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact et accès – Reyssac Bois", url: "/contact" },
}

const HOURS = [
  { day: "Lundi – Vendredi", hours: "8h30–12h · 14h–18h" },
  { day: "Samedi", hours: "Fermé" },
  { day: "Dimanche", hours: "Fermé" },
]

export default function ContactPage() {
  const { address } = BUSINESS

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: absoluteUrl("/contact"),
          name: "Contact – Reyssac Bois",
          about: { "@id": BUSINESS_ID },
        }}
      />
      <Container className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
          <PageHeader
            eyebrow="CONTACT"
            title="Contact et accès au dépôt"
            crumb={{ name: "Contact", href: "/contact" }}
          >
            <p>
              Disponibilité, devis, liste de débit, découpe ou livraison : appelez-nous, écrivez-nous ou
              passez au dépôt de Boé, aux portes d&apos;Agen.
            </p>
          </PageHeader>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <PageCard title="Nos coordonnées">
                <dl className="space-y-4 text-sm sm:text-base">
                  <div>
                    <dt className="font-semibold text-gray-900">Téléphone</dt>
                    <dd className="mt-1">
                      <a
                        href={`tel:${BUSINESS.phoneE164}`}
                        className="text-lg font-bold text-green-800 hover:underline underline-offset-4"
                      >
                        {BUSINESS.phoneDisplay}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">E-mail</dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${BUSINESS.email}`}
                        className="break-all text-green-800 hover:underline underline-offset-4"
                      >
                        {BUSINESS.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">Adresse du dépôt</dt>
                    <dd className="mt-1 not-italic text-gray-700">
                      {BUSINESS.name}
                      <br />
                      {address.street}
                      <br />
                      {address.postalCode} {address.city} ({address.nearCity}, {address.department})
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">Horaires</dt>
                    <dd className="mt-1">
                      <table className="w-full max-w-xs text-gray-700">
                        <tbody>
                          {HOURS.map((h) => (
                            <tr key={h.day}>
                              <th scope="row" className="py-0.5 pr-4 text-left font-normal">
                                {h.day}
                              </th>
                              <td className="py-0.5 text-right font-medium text-gray-900">{h.hours}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`tel:${BUSINESS.phoneE164}`}
                    className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
                  >
                    Appeler
                  </a>
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-white"
                  >
                    Itinéraire vers le dépôt
                  </a>
                </div>
              </PageCard>

              <MapEmbed className="hidden lg:block" />
            </div>

            <PageCard title="Demande de devis ou d'information">
              <ContactForm />
            </PageCard>

            <MapEmbed className="lg:hidden" />
          </div>

          <PageCard title="Avant de nous contacter">
            <ul className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 sm:text-base">
              <li>
                <Link href="/produits" className="font-semibold text-green-800 hover:underline">
                  Consulter le catalogue →
                </Link>
              </li>
              <li>
                <Link href="/livraison-bois" className="font-semibold text-green-800 hover:underline">
                  Zones et conditions de livraison →
                </Link>
              </li>
              <li>
                <Link href="/decoupe-panneaux-sur-mesure" className="font-semibold text-green-800 hover:underline">
                  Préparer une liste de découpe →
                </Link>
              </li>
            </ul>
          </PageCard>
        </div>
      </Container>
    </>
  )
}
