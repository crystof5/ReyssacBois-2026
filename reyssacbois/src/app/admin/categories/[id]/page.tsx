import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { startSubCategoryFromCategoryAction, updateCategoryAction } from "@/admin/actions/categories"
import { startProduitFromCategoryAction } from "@/admin/actions/produits"
import ImageUploadField from "@/admin/components/ImageUploadField"
import SlugField from "@/admin/components/SlugField"
import SortableList from "@/admin/components/SortableList"
import CategoryParentSelector from "@/admin/components/CategoryParentSelector"
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar"
import RichTextEditor from "@/admin/components/RichTextEditor"

export default async function AdminCategoryEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string }>
  searchParams?: Promise<{ prefillParentId?: string; saved?: string }>
}) {
  const { id } = await params
  if (!id) notFound()

  const sp = (await searchParams) ?? {}
  const saved = sp.saved === "1"
  const prefillParentId =
    typeof sp.prefillParentId === "string" ? sp.prefillParentId.trim() : ""

  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
      include: {
        children: { include: { _count: { select: { children: true, products: true } } } },
        products: {
          include: { product: true },
        },
      },
    }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ])

  if (!category) notFound()

  const byId = new Map(allCategories.map((c) => [c.id, c]))
  const parentsChain: Array<{ id: string; name: string }> = []
  {
    const seen = new Set<string>([category.id])
    let curParentId: string | null = category.parentId
    while (curParentId) {
      const p = byId.get(curParentId)
      if (!p) break
      if (seen.has(p.id)) break
      parentsChain.push({ id: p.id, name: p.name })
      seen.add(p.id)
      curParentId = p.parentId
    }
    parentsChain.reverse()
  }

  const effectiveParentId = (category.parentId ?? prefillParentId) || null

  return (
    <div>
      <div className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Éditer la catégorie</h2>
            <p className="mt-1 text-sm text-ink-600">
              Modifie les champs puis enregistre.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <Link href="/admin" className="text-sm text-ink-600 hover:underline">
              ← Administration
            </Link>
            <Link href="/admin/categories" className="text-sm text-ink-600 hover:underline">
              ← Catégories
            </Link>
          </div>
        </div>

        <nav aria-label="Fil d’Ariane admin" className="mt-4">
          <ol className="inline-flex max-w-full flex-wrap items-center gap-2 border-b border-line pb-2 text-xs text-ink-600">
            <li className="min-w-0">
              <Link href="/admin" className="font-medium text-ink hover:underline underline-offset-4">
                Administration
              </Link>
            </li>
            <li className="flex min-w-0 items-center gap-1">
              <span className="text-line-strong" aria-hidden>
                /
              </span>
              <Link href="/admin/categories" className="font-medium text-ink-600 hover:underline underline-offset-4">
                Catégories
              </Link>
            </li>
            {parentsChain.map((p) => (
              <li key={p.id} className="flex min-w-0 items-center gap-1">
                <span className="text-line-strong" aria-hidden>
                  /
                </span>
                <Link
                  href={`/admin/categories/${p.id}`}
                  className="rb-clamp-1 max-w-[40ch] font-medium text-ink-600 hover:text-ink hover:underline underline-offset-4"
                  title={p.name}
                >
                  {p.name}
                </Link>
              </li>
            ))}
            <li className="flex min-w-0 items-center gap-1">
              <span className="text-line-strong" aria-hidden>
                /
              </span>
              <span className="rb-clamp-1 max-w-[40ch] font-semibold text-ink" title={category.name}>
                {category.name}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {saved ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-forest-050 px-4 py-3 text-sm text-forest-800">
          Enregistré.
        </div>
      ) : null}

      <form action={updateCategoryAction} className="mt-6 space-y-4 rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <input type="hidden" name="id" value={category.id} />
        {/* Ordre géré par le glisser-déposer (sidebar / sous-catégories). On conserve la valeur sans l’afficher. */}
        <input type="hidden" name="sortOrder" value={String(category.sortOrder ?? 0)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom" required>
            <input
              name="name"
              defaultValue={category.name}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
              required
            />
          </Field>

          <SlugField defaultValue={category.slug} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Visible">
            <select
              name="isVisible"
              defaultValue={category.isVisible ? "1" : "0"}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            >
              <option value="1">Visible</option>
              <option value="0">Cachée</option>
            </select>
          </Field>
          {effectiveParentId ? null : (
            <div className="rounded-2xl border border-line bg-surface p-3 text-xs text-ink-600 shadow-sm ring-1 ring-black/5">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="isTopCategory"
                  value="1"
                  defaultChecked={category.isTopCategory}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-semibold text-ink">Catégorie principale</span>
                  <span className="block mt-0.5">
                    Affichée dans le menu catégories (sidebar) côté public.
                  </span>
                </span>
              </label>
            </div>
          )}
          <div className="rounded-2xl border border-line bg-surface p-3 text-xs text-ink-600 shadow-sm ring-1 ring-black/5">
            <p className="font-semibold text-ink">Ordre d’affichage</p>
            <p className="mt-1">
              Géré automatiquement via le glisser-déposer (sidebar / page du parent).
            </p>
          </div>
        </div>

        <div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Description</span>
            <p className="mt-1 text-xs text-ink-400">
              Mise en forme possible (gras, souligné, italique, listes, liens, couleur).
            </p>
          </label>
          <div className="mt-3">
            <RichTextEditor
              inputName="descriptionHtml"
              initialHtml={category.descriptionHtml ?? category.description ?? ""}
              placeholder="Description…"
            />
          </div>
        </div>

        <ImageUploadField
          label="Image"
          inputName="imageUrl"
          initialUrl={category.imageUrl ?? ""}
          folder={`categories/${category.id}`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <div className="flex justify-end">
              <input type="hidden" name="createChildParentId" value={category.id} />
              <button
                type="submit"
                formAction={startSubCategoryFromCategoryAction}
                className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2"
              >
                + Ajouter une sous-catégorie
              </button>
            </div>

            <SortableList
              title={`Sous-catégories (${category.children.length})`}
              description="Glisse-dépose pour définir l’ordre d’affichage sous ce parent. Détachage possible uniquement pour les sous-catégories vides (0 sous-cat., 0 produits)."
              items={category.children
                .slice()
                .sort((a, b) => {
                  const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                  if (byOrder !== 0) return byOrder
                  return a.name.localeCompare(b.name, "fr")
                })
                .map((child) => ({
                  // Détachage autorisé uniquement si la sous-catégorie est "nue"
                  // (sinon elle deviendrait orpheline et on perdrait la navigation des produits dessous).
                  canDetach: child._count.children === 0 && child._count.products === 0,
                  detachDisabledReason: `Non détachable: ${child._count.children} sous-cat. • ${child._count.products} produits`,
                  id: child.id,
                  title: child.name,
                  subtitle: `/${child.slug}`,
                  rightNote: `${child._count.children} sous-cat. • ${child._count.products} produits`,
                  isVisible: child.isVisible,
                  editHref: `/admin/categories/${child.id}`,
                  viewHref: `/categories/${child.slug}`,
                }))}
              saveKind="categoryChildren"
              scopeId={category.id}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-end">
              <input type="hidden" name="categoryId" value={category.id} />
              <button
                type="submit"
                formAction={startProduitFromCategoryAction}
                className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2"
              >
                + Ajouter un produit à cette catégorie
              </button>
            </div>

            <SortableList
              title={`Produits (${category.products.length})`}
              description="Glisse-dépose pour définir l’ordre d’affichage des produits dans cette catégorie."
              items={category.products
                .map((p) => p.product)
                .slice()
                .sort((a, b) => {
                  const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                  if (byOrder !== 0) return byOrder
                  return a.name.localeCompare(b.name, "fr")
                })
                .map((p) => ({
                  id: p.id,
                  title: p.name,
                  subtitle: `/${p.slug}`,
                  isVisible: p.isVisible,
                  // Permet à la page produit d'afficher un retour vers la catégorie d'origine.
                  editHref: `/admin/produits/${p.id}?prefillCategoryId=${encodeURIComponent(category.id)}`,
                  viewHref: `/produits/${p.slug}`,
                }))}
              saveKind="categoryProducts"
              scopeId={category.id}
            />
          </div>
        </div>

        <Field label="Parent">
          <CategoryParentSelector
            categories={allCategories.map((c) => ({
              id: c.id,
              name: c.name,
              parentId: c.parentId,
              sortOrder: c.sortOrder ?? 0,
            }))}
            currentId={category.id}
            initialParentId={effectiveParentId}
          />
        </Field>

        <AdminStickySaveBar
          hint="Modifie, puis enregistre (la page confirme quand c’est OK)."
          secondaryHref={`/categories/${category.slug}`}
          secondaryLabel="Voir sur le site"
        />
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  )
}


