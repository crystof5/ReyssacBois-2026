import Link from "next/link"
import AdminHealthPanel from "@/admin/components/AdminHealthPanel"

export default async function AdminPage() {
  const items = [
    {
      title: "Accueil",
      desc: "Gérer les images du hero et la vitesse.",
      href: "/admin/home",
    },
    {
      title: "Catégories",
      desc: "Créer/modifier l’arborescence et les contenus.",
      href: "/admin/categories",
    },
    {
      title: "Produits",
      desc: "Gérer les fiches produits et leurs caractéristiques.",
      href: "/admin/produits",
    },
    {
      title: "Conseils (guides)",
      desc: "Rédiger, publier et organiser les guides pratiques.",
      href: "/admin/conseils",
    },
    {
      title: "Pages Livraison & Découpe",
      desc: "Zones, étapes, FAQ et textes des pages de service.",
      href: "/admin/pages",
    },
  ]

  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-ink">Tableau de bord</h2>
      <p className="mt-1 text-sm text-ink-600">
        Accès rapide aux contenus et points de contrôle du catalogue.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rb-card-interactive group p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading font-bold text-ink group-hover:text-forest-700">
                {it.title}
              </h3>
              <span className="text-line-strong transition-transform group-hover:translate-x-0.5 group-hover:text-forest-700">
                →
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-600">{it.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <AdminHealthPanel />
      </div>
    </div>
  )
}


