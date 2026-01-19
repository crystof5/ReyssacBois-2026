import Link from "next/link"

export default function AdminPage() {
  const items = [
    {
      title: "Accueil / Carrousel",
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
      title: "Import CSV",
      desc: "Importer/réimporter le catalogue depuis un CSV.",
      href: "/admin/import",
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      <p className="mt-1 text-sm text-gray-600">
        Commence en lecture seule, puis on active l’édition étape par étape.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-green-300 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-green-800">
                {it.title}
              </h3>
              <span className="text-gray-400 group-hover:text-green-700">→</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{it.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}


