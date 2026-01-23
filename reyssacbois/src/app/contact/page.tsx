import Breadcrumb from "@/components/Breadcrumb"
import ContactForm from "@/components/ContactForm"
import Container from "@/components/ui/Container"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Reyssac Bois pour un devis, une disponibilité ou une question sur nos produits bois.",
  alternates: { canonical: "/contact" },
}

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
                <span className="font-medium text-gray-900">Téléphone :</span>{" "}
                05 53 96 15 97
              </li>
              <li>
                <span className="font-medium text-gray-900">Horaires :</span>{" "}
                Lun–Ven, 8h–18h
              </li>
            </ul>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
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

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </Container>
  )
}


