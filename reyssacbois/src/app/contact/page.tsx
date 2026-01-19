import Breadcrumb from "@/components/Breadcrumb"
import ContactForm from "@/components/ContactForm"
import Container from "@/components/ui/Container"

export default function ContactPage() {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumb items={[{ id: "contact", name: "Contact", href: "/contact" }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Contact
          </h1>
          <p className="mt-3 text-gray-600">
            Une question, un devis, une disponibilité ? Décrivez votre besoin et nous vous répondons rapidement.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Informations
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>
                <span className="font-medium text-gray-900">Email :</span>{" "}
                contact@reyssacbois.fr
              </li>
              <li>
                <span className="font-medium text-gray-900">Téléphone :</span>{" "}
                05 53 96 15 97
              </li>
              <li>
                <span className="font-medium text-gray-900">Horaires :</span>{" "}
                Lun–Ven, 8h–18h
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              (Tu pourras remplacer ces infos par les vraies coordonnées.)
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </Container>
  )
}


