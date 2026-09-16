import { JsonLd } from "@/components/JsonLd"
import { PageCard } from "@/components/pages/PageHeader"

export type FaqItem = { question: string; answer: string }

/** FAQ dépliable (mobile first) + JSON-LD FAQPage. */
export default function FaqSection({ title = "Questions fréquentes", items }: { title?: string; items: FaqItem[] }) {
  return (
    <PageCard title={title}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((it) => ({
            "@type": "Question",
            name: it.question,
            acceptedAnswer: { "@type": "Answer", text: it.answer },
          })),
        }}
      />
      <div className="divide-y divide-gray-200/80">
        {items.map((it) => (
          <details key={it.question} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-base font-semibold text-gray-900">
              <span>{it.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-xl leading-none text-green-700 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-700">{it.answer}</p>
          </details>
        ))}
      </div>
    </PageCard>
  )
}
