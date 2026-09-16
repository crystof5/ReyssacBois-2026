import Link from "next/link"
import PublicViewLink from "@/admin/components/PublicViewLink"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateProduitAction } from "@/admin/actions/produits"
import ImageUploadField from "@/admin/components/ImageUploadField"
import SlugField from "@/admin/components/SlugField"
import ProductCategoriesSelector from "@/admin/components/ProductCategoriesSelector"
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar"
import RichTextEditor from "@/admin/components/RichTextEditor"

export default async function AdminProduitEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string }>
  searchParams?: Promise<{ saved?: string; prefillCategoryId?: string }>
}) {
  const { id } = await params
  if (!id) notFound()

  const sp = (await searchParams) ?? {}
  const saved = sp.saved === "1"
  const prefillCategoryId =
    typeof sp.prefillCategoryId === "string" ? sp.prefillCategoryId.trim() : ""

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { categories: true },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, parentId: true, sortOrder: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ])

  if (!product) notFound()

  const linkedCategoryIds = Array.from(new Set(product.categories.map((c) => c.categoryId)))
  const selectedCategoryIds = new Set(linkedCategoryIds)
  const initialSelectedIds = Array.from(
    new Set([
      ...Array.from(selectedCategoryIds),
      ...(prefillCategoryId ? [prefillCategoryId] : []),
    ]),
  )

  // Contexte breadcrumb:
  // - si le produit n'est rattaché qu'à 1 catégorie, on utilise celle-ci (typiquement une sous-catégorie)
  // - sinon on utilise le prefillCategoryId (si on vient d'une catégorie)
  const contextCategoryId =
    linkedCategoryIds.length === 1 ? linkedCategoryIds[0] : prefillCategoryId

  const contextCategory = contextCategoryId
    ? categories.find((c) => c.id === contextCategoryId)
    : undefined

  const byId = new Map(categories.map((c) => [c.id, c]))
  const contextChain: Array<{ id: string; name: string }> = []
  if (contextCategoryId) {
    const seen = new Set<string>()
    let cur: string | null = contextCategoryId
    let guard = 0
    while (cur) {
      const c = byId.get(cur)
      if (!c) break
      if (seen.has(c.id)) break
      contextChain.push({ id: c.id, name: c.name })
      seen.add(c.id)
      cur = c.parentId
      guard += 1
      if (guard > 50) break
    }
    contextChain.reverse()
  }

  return (
    <div>
      <div className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Éditer le produit</h2>
            <p className="mt-1 text-sm text-ink-600">Modifie les champs puis enregistre.</p>
          </div>
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <PublicViewLink href={`/produits/${product.slug}`} isVisible={product.isVisible} />
            <Link href="/admin" className="text-sm text-ink-600 hover:underline">
              ← Administration
            </Link>
            {contextCategoryId ? (
              <Link
                href={`/admin/categories/${contextCategoryId}`}
                className="text-sm text-ink-600 hover:underline"
                title={contextCategory?.name ? `Retour à : ${contextCategory.name}` : "Retour à la catégorie"}
              >
                ← {contextCategory?.name ? contextCategory.name : "Catégorie"}
              </Link>
            ) : null}
            <Link href="/admin/produits" className="text-sm text-ink-600 hover:underline">
              ← Produits
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
              <Link href="/admin/produits" className="font-medium text-ink-600 hover:underline underline-offset-4">
                Produits
              </Link>
            </li>
            {contextChain.length ? (
              <>
                <li className="flex min-w-0 items-center gap-1">
                  <span className="text-line-strong" aria-hidden>
                    /
                  </span>
                  <Link
                    href="/admin/categories"
                    className="font-medium text-ink-600 hover:underline underline-offset-4"
                  >
                    Catégories
                  </Link>
                </li>
                {contextChain.map((c) => (
                  <li key={c.id} className="flex min-w-0 items-center gap-1">
                    <span className="text-line-strong" aria-hidden>
                      /
                    </span>
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="rb-clamp-1 max-w-[40ch] font-medium text-ink-600 hover:text-ink hover:underline underline-offset-4"
                      title={c.name}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </>
            ) : null}
            <li className="flex min-w-0 items-center gap-1">
              <span className="text-line-strong" aria-hidden>
                /
              </span>
              <span className="rb-clamp-1 max-w-[40ch] font-semibold text-ink" title={product.name}>
                {product.name}
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

      <form action={updateProduitAction} className="mt-6 space-y-5 rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <input type="hidden" name="id" value={product.id} />
        {/* Ordre global non géré ici: on conserve la valeur sans l’afficher. */}
        <input type="hidden" name="sortOrder" value={String(product.sortOrder ?? 0)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom" required>
            <input
              name="name"
              defaultValue={product.name}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
              required
            />
          </Field>

          <SlugField defaultValue={product.slug} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Visible">
            <select
              name="isVisible"
              defaultValue={product.isVisible ? "1" : "0"}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            >
              <option value="1">Visible</option>
              <option value="0">Caché</option>
            </select>
          </Field>
          <div className="rounded-2xl border border-line bg-surface p-3 text-xs text-ink-600 shadow-sm ring-1 ring-black/5">
            <p className="font-semibold text-ink">Ordre d’affichage</p>
            <p className="mt-1">
              Géré via les catégories (ordre des produits dans une catégorie).
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
              initialHtml={product.descriptionHtml ?? product.description ?? ""}
              placeholder="Description…"
            />
          </div>
        </div>

        <ImageUploadField
          label="Image"
          inputName="imageUrl"
          initialUrl={product.imageUrl ?? ""}
          folder={`produits/${product.id}`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Section">
            <input
              name="section"
              defaultValue={product.section ?? ""}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            />
          </Field>
          <Field label="Longueur">
            <input
              name="length"
              defaultValue={product.length ?? ""}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            />
          </Field>
          <Field label="Largeur">
            <input
              name="width"
              defaultValue={product.width ?? ""}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            />
          </Field>
          <Field label="Type">
            <input
              name="type"
              defaultValue={product.type ?? ""}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-forest-700/20"
            />
          </Field>
        </div>

        <Field label="Catégories">
          <ProductCategoriesSelector
            categories={categories}
            initialSelectedIds={initialSelectedIds}
          />
          <p className="mt-2 text-xs text-ink-400">
            Un produit peut appartenir à plusieurs catégories.
          </p>
        </Field>

        <AdminStickySaveBar
          hint="Modifie, puis enregistre (la page confirme quand c’est OK)."
          secondaryHref={`/produits/${product.slug}`}
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


