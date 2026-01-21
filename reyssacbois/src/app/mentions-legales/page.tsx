import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import { Card } from "@/components/ui/Card"

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
}

export default function MentionsLegalesPage() {
  return (
    <div className="bg-gradient-to-b from-amber-50 to-white">
      <Container className="py-10 sm:py-14">
        <div className="max-w-3xl break-words">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Mentions légales</h1>
          <p className="mt-3 text-gray-600">
            Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN).
          </p>
        </div>

        <div className="mt-8 grid gap-6 break-words">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Éditeur du site</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">Raison sociale :</span> Reyssac Bois</p>
              <p><span className="font-semibold">Forme juridique :</span> SARL</p>
              <p><span className="font-semibold">Adresse :</span> 1250 avenue Jean Nogues 47550 Bien</p>
              <p><span className="font-semibold">SIRET :</span> 415 010 016 00012</p>
              <p><span className="font-semibold">RCS :</span> Agen</p>
              <p><span className="font-semibold">TVA intracommunautaire :</span> FR43 415 010 016</p>
              <p><span className="font-semibold">Téléphone :</span> 0553961597</p>
              <p><span className="font-semibold">E-mail :</span> reyssacbois@orange.fr</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Directeur de publication</h2>
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-semibold">Nom :</span> Reyssac Benoît
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Hébergement</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Hébergeur :</span> Vercel Inc.
              </p>
              <p><span className="font-semibold">Adresse :</span> 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
              <p><span className="font-semibold">Site web :</span> vercel.com</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Propriété intellectuelle</h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              L’ensemble des contenus présents sur ce site (textes, images, logos, éléments graphiques, etc.) est protégé par le droit d’auteur et, le cas échéant, par le droit des marques.
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sauf autorisation écrite préalable.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Données personnelles</h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              Pour en savoir plus sur la collecte et le traitement des données personnelles (formulaire de contact, mesure d’audience, cookies), veuillez consulter la page « Confidentialité & cookies ».
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

