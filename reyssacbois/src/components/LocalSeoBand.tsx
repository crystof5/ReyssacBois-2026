import Link from "next/link"
import Container from "@/components/ui/Container"
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "@/lib/business"

/**
 * Bande "négoce bois à Agen" pleine largeur, affichée entre le contenu catalogue
 * et le footer (slot @seo des layouts catégories / produits).
 */
export default function LocalSeoBand({
  heading,
  paragraphs,
}: {
  heading: string
  paragraphs: string[]
}) {
  return (
    <section
      aria-labelledby="local-seo-heading"
      // -mb-8 : annule le mt-8 du footer pour que la bande soit collée au footer.
      className="-mb-8 border-t border-white/10 bg-green-950/90 text-white backdrop-blur"
    >
      <Container className="py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold tracking-wide text-green-300">
              VOTRE NÉGOCIANT BOIS À AGEN DEPUIS {BUSINESS.foundingYear}
            </p>
            <h2 id="local-seo-heading" className="mt-2 text-2xl sm:text-3xl font-bold">
              {heading}
            </h2>
            <div className="mt-4 space-y-3 text-sm sm:text-base leading-relaxed text-white/80 max-w-2xl">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-sm">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-green-300">Dépôt</dt>
                <dd className="mt-1 text-white/85">
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    {BUSINESS_ADDRESS_ONE_LINE} (Agen)
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-green-300">Téléphone</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${BUSINESS.phoneE164}`}
                    className="font-semibold text-white hover:underline underline-offset-4"
                  >
                    {BUSINESS.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-green-300">Horaires</dt>
                <dd className="mt-1 text-white/85">{BUSINESS.openingHours.display}</dd>
              </div>
              <div>
                <dt className="font-semibold text-green-300">Livraison</dt>
                <dd className="mt-1 text-white/85">
                  Agglomération d&apos;Agen, Lot-et-Garonne, Gers, Tarn-et-Garonne. De Bordeaux à
                  Toulouse sur devis.
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-green-900 shadow-sm hover:bg-green-50"
              >
                Demander un devis
              </Link>
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Itinéraire
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
