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
      <div className="rb-surface p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">
              Accueil
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              Choisis un bloc à éditer (pages plus petites, plus rapides).
            </p>
          </div>
          <Link href="/admin" className="text-sm text-ink-600 underline-offset-4 hover:text-forest-700 hover:underline">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}
