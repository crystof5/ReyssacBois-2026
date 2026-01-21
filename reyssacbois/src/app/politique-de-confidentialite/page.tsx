import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import { Card } from "@/components/ui/Card"
import CookieSettingsButton from "@/components/CookieSettingsButton"

export const metadata: Metadata = {
  title: "Confidentialité & cookies",
  alternates: { canonical: "/politique-de-confidentialite" },
}

export default function PolitiqueDeConfidentialitePage() {
  const cookieRows = [
    {
      type: "Essentiels",
      name: "Cookies techniques [variables selon le navigateur]",
      purpose: "Navigation, sécurité, fonctionnement du site",
      duration: "Session / selon navigateur",
    },
    {
      type: "Mesure d’audience",
      name: "Google Analytics (GA4)",
      purpose: "Statistiques de visite et amélioration du site",
      duration: "Jusqu’à 13 mois [selon config GA]",
    },
    {
      type: "Préférence",
      name: "rb_cookie_consent (Reyssac Bois)",
      purpose: "Mémoriser votre choix cookies",
      duration: "180 jours",
    },
  ] as const

  return (
    <div className="bg-gradient-to-b from-amber-50 to-white overflow-x-hidden">
      <Container className="py-10 sm:py-14">
        <div className="max-w-3xl break-words">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Confidentialité & cookies</h1>
          <p className="mt-3 text-gray-600">
            Cette page explique quelles données sont collectées, dans quel but, et comment gérer vos préférences cookies.
          </p>
        </div>

        <div className="mt-8 grid gap-6 break-words">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">1) Responsable du traitement</h2>
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-semibold">Reyssac Bois</span> <span className="text-gray-500">[à compléter avec l’entité juridique et l’adresse]</span>.
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Contact : <span className="text-gray-500">[email / téléphone à compléter]</span>.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">2) Données collectées</h2>
            <div className="mt-3 space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold">Formulaire de contact</p>
                <p className="mt-1 text-gray-700">
                  Lorsque vous nous contactez, nous traitons les informations que vous saisissez (nom, email, message, etc.) afin de répondre à votre demande.
                </p>
              </div>
              <div>
                <p className="font-semibold">Mesure d’audience (optionnel)</p>
                <p className="mt-1 text-gray-700">
                  Si vous l’acceptez, nous utilisons Google Analytics (GA4) pour mesurer l’audience et améliorer le site (pages visitées, interactions, etc.). Ces cookies ne sont déposés qu’après votre consentement.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">3) Finalités et bases légales</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><span className="font-semibold">Répondre aux demandes</span> via le formulaire de contact (intérêt légitime / exécution de mesures précontractuelles selon le contexte).</li>
              <li><span className="font-semibold">Mesure d’audience</span> (consentement).</li>
              <li><span className="font-semibold">Sécurité et fonctionnement</span> du site (intérêt légitime).</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">4) Cookies</h2>
            <p className="mt-3 text-sm text-gray-700">
              Vous pouvez modifier votre choix à tout moment :
            </p>
            <div className="mt-3">
              <CookieSettingsButton className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-green-600/30">
                Gérer mes cookies
              </CookieSettingsButton>
            </div>

            {/* Mobile: vue "cartes" (0 débordement horizontal) */}
            <div className="mt-5 space-y-3 sm:hidden">
              {cookieRows.map((row) => (
                <div key={row.type} className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">{row.type}</p>
                  <dl className="mt-3 space-y-2 text-sm text-gray-700">
                    <div className="grid grid-cols-[110px_1fr] gap-3">
                      <dt className="text-gray-500">Nom</dt>
                      <dd className="break-words">{row.name}</dd>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-3">
                      <dt className="text-gray-500">But</dt>
                      <dd className="break-words">{row.purpose}</dd>
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-3">
                      <dt className="text-gray-500">Durée</dt>
                      <dd className="break-words">{row.duration}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            {/* Desktop: tableau */}
            <div className="mt-5 hidden sm:block w-full max-w-full overflow-x-auto">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full table-fixed text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="w-32 px-4 py-3 font-semibold">Type</th>
                      <th className="w-64 px-4 py-3 font-semibold">Nom / fournisseur</th>
                      <th className="px-4 py-3 font-semibold">But</th>
                      <th className="w-40 px-4 py-3 font-semibold">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                    {cookieRows.map((row) => (
                      <tr key={row.type} className="align-top">
                        <td className="px-4 py-3">{row.type}</td>
                        <td className="px-4 py-3 break-words">{row.name}</td>
                        <td className="px-4 py-3 break-words">{row.purpose}</td>
                        <td className="px-4 py-3 break-words">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">5) Destinataires et sous-traitants</h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              Les données peuvent être traitées par des prestataires techniques (hébergeur, email) et, si vous l’acceptez, par Google (Analytics).
              <span className="text-gray-500"> [à compléter si vous utilisez d’autres prestataires]</span>
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">6) Durées de conservation</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-2">
              <li><span className="font-semibold">Demandes via contact</span> : durée nécessaire au traitement, puis archivage limité <span className="text-gray-500">[à préciser]</span>.</li>
              <li><span className="font-semibold">Cookies de mesure d’audience</span> : selon la configuration GA (généralement jusqu’à 13 mois).</li>
              <li><span className="font-semibold">Choix cookies</span> : 180 jours.</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">7) Vos droits</h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              Conformément au RGPD, vous disposez de droits d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité.
              Pour exercer vos droits, contactez-nous à <span className="text-gray-500">[email à compléter]</span>.
              Vous pouvez également introduire une réclamation auprès de la CNIL.
            </p>
          </Card>
        </div>

        <p className="mt-10 text-xs text-gray-500">
          Dernière mise à jour : <span className="font-medium">{new Date().toLocaleDateString("fr-FR")}</span>
        </p>
      </Container>
    </div>
  )
}

