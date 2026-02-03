import Link from "next/link";

export default function AdminHomeMenuPage() {
  const items = [
    {
      title: "Partie haute + police",
      desc: "Identité visuelle (police) + Hero (photo, titres, badge, mini-blocs).",
      href: "/admin/home/haut",
    },
    {
      title: "Une histoire de famille",
      desc: "Image + titre + texte (rich text).",
      href: "/admin/home/famille",
    },
    {
      title: "Catalogue",
      desc: "Titre/intro + jusqu’à 3 cartes (produit ou catégorie) avec vrais liens.",
      href: "/admin/home/catalogue",
    },
    {
      title: "À propos (Qui sommes-nous)",
      desc: "Notre histoire, mission, localisation… (rich text + image).",
      href: "/admin/home/a-propos",
    },
    {
      title: "Contact — Informations",
      desc: "Bloc à gauche du formulaire (rich text).",
      href: "/admin/home/contact",
    },
    {
      title: "Projets (carrousel)",
      desc: "Vitesse + slides du carrousel.",
      href: "/admin/home/projets",
    },
    {
      title: "FAQ",
      desc: "Activer/désactiver + questions/réponses (rich text).",
      href: "/admin/home/faq",
    },
    {
      title: "Promo (modale)",
      desc: "Titre + texte + image + visibilité.",
      href: "/admin/home/promo",
    },
    {
      title: "Bannière “site en construction”",
      desc: "Texte + visibilité.",
      href: "/admin/home/banniere",
    },
    {
      title: "Tout-en-un (ancienne page)",
      desc: "Page complète (très longue) regroupant tous les blocs.",
      href: "/admin/home/complet",
    },
  ];

  return (
    <div>
      <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Accueil
            </h2>
            <p className="mt-1 text-sm text-gray-700">
              Choisis un bloc à éditer (pages plus petites, plus rapides).
            </p>
          </div>
          <Link href="/admin" className="text-sm text-gray-700 hover:underline">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group rounded-2xl border border-white/20 bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur hover:bg-white/80 hover:shadow-[0_14px_60px_-50px_rgba(0,0,0,0.7)] transition"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-green-800">
                {it.title}
              </h3>
              <span className="text-gray-400 group-hover:text-green-700">
                →
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{it.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
