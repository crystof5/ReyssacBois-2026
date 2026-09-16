/** Bouton "Voir sur le site" (nouvel onglet) pour les fiches d'édition admin. */
export default function PublicViewLink({ href, isVisible }: { href: string; isVisible: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="rb-btn rb-btn-secondary inline-flex items-center gap-1.5 whitespace-nowrap"
      title={isVisible ? "Ouvrir la page publique dans un nouvel onglet" : "Élément masqué : la page publique renverra une erreur 404"}
    >
      Voir sur le site
      <span aria-hidden="true">↗</span>
      {!isVisible ? <span className="text-xs font-normal text-ink-400">(masqué)</span> : null}
    </a>
  )
}
