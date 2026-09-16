import AdminPageHeader from "@/admin/components/editorial/AdminPageHeader"
import ServicePageEditor, { type ServicePageDraft } from "@/admin/components/editorial/ServicePageEditor"
import { resetServicePageAction } from "@/admin/actions/editorial"

/** Écran admin commun aux pages Livraison et Découpe. */
export default function ServicePageAdmin({
  page,
  title,
  path,
  initial,
  updatedAt,
  reset,
}: {
  page: "livraison" | "decoupe"
  title: string
  path: string
  initial: ServicePageDraft
  updatedAt: Date | null
  reset: boolean
}) {
  return (
    <div>
      <AdminPageHeader
        title={title}
        subtitle={updatedAt ? "Contenu personnalisé." : "Contenu d'origine (pas encore modifié)."}
        crumbs={[{ label: "Pages & conseils", href: "/admin/pages" }, { label: title }]}
        actions={
          <>
            <a href={path} target="_blank" rel="noopener" className="rb-btn rb-btn-secondary">
              Voir sur le site ↗
            </a>
            {updatedAt ? (
              <form action={resetServicePageAction}>
                <input type="hidden" name="page" value={page} />
                <button type="submit" className="rb-btn rb-btn-secondary" title="Revenir au contenu d'origine">
                  Restaurer l&apos;original
                </button>
              </form>
            ) : null}
          </>
        }
      />
      {reset ? (
        <p className="mt-4 rounded border border-forest-700/30 bg-forest-050 p-3 text-sm font-medium text-forest-800">
          ✓ Contenu d&apos;origine restauré.
        </p>
      ) : null}
      <ServicePageEditor key={updatedAt?.getTime() ?? 0} page={page} path={path} initial={initial} />
    </div>
  )
}
