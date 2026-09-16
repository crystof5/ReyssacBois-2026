import Link from "next/link"
import AdminPageHeader from "@/admin/components/editorial/AdminPageHeader"
import { getAdminArticles } from "@/admin/queries/editorial"

export const dynamic = "force-dynamic"

export default async function AdminPagesHub() {
  const articles = await getAdminArticles()
  const published = articles.filter((a) => a.isVisible).length
  const drafts = articles.length - published

  const cards = [
    {
      href: "/admin/conseils",
      icon: "📚",
      title: "Conseils (guides)",
      desc: "Rédiger, publier et organiser les guides pratiques.",
      badge: `${published} publié${published > 1 ? "s" : ""} · ${drafts} brouillon${drafts > 1 ? "s" : ""}`,
      view: "/conseils",
    },
    {
      href: "/admin/pages/livraison",
      icon: "🚚",
      title: "Page Livraison",
      desc: "Zones desservies, étapes, questions fréquentes.",
      view: "/livraison-bois",
    },
    {
      href: "/admin/pages/decoupe",
      icon: "🪚",
      title: "Page Découpe sur mesure",
      desc: "Informations de commande, travaux à façon, FAQ.",
      view: "/decoupe-panneaux-sur-mesure",
    },
    {
      href: "/admin/home/a-propos",
      icon: "🏡",
      title: "Qui sommes-nous",
      desc: "Mission et localisation (textes partagés avec l'accueil).",
      view: "/qui-sommes-nous",
    },
    {
      href: "/admin/home/contact",
      icon: "📞",
      title: "Contact",
      desc: "Bloc d'informations de contact.",
      view: "/contact",
    },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pages & conseils"
        subtitle="Tous les contenus éditoriaux du site, au même endroit."
        crumbs={[{ label: "Pages & conseils" }]}
      />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href} className="rb-card-interactive group flex flex-col p-5">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-forest-050 text-2xl">
                {c.icon}
              </span>
              <div className="min-w-0">
                <Link
                  href={c.href}
                  className="font-heading text-base font-bold text-ink after:absolute after:inset-0 group-hover:text-forest-700"
                >
                  {c.title}
                </Link>
                <p className="mt-1 text-sm text-ink-600">{c.desc}</p>
                {c.badge ? (
                  <p className="mt-2 inline-flex rounded bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink-600 ring-1 ring-line">
                    {c.badge}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="relative z-10 mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
              <span className="font-semibold text-forest-700">Modifier →</span>
              <a href={c.view} target="_blank" rel="noopener" className="text-ink-600 hover:text-forest-700 hover:underline">
                Voir sur le site ↗
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
