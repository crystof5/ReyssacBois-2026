import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { startSubCategoryFromCategoryAction, updateCategoryAction } from "@/admin/actions/categories"
import { startProduitFromCategoryAction } from "@/admin/actions/produits"
import ImageUploadField from "@/admin/components/ImageUploadField"
import SlugField from "@/admin/components/SlugField"
import SortableList from "@/admin/components/SortableList"

export default async function AdminCategoryEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string }>
  searchParams?: Promise<{ prefillParentId?: string }>
}) {
  const { id } = await params
  if (!id) notFound()

  const sp = (await searchParams) ?? {}
  const prefillParentId =
    typeof sp.prefillParentId === "string" ? sp.prefillParentId.trim() : ""

  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: {
          include: { product: true },
        },
      },
    }),
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ])

  if (!category) notFound()

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Éditer la catégorie
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Modifie les champs puis enregistre.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Link
            href="/admin"
            className="text-sm text-gray-700 hover:underline"
          >
            ← Administration
          </Link>
          <Link
            href="/admin/categories"
            className="text-sm text-gray-700 hover:underline"
          >
            ← Catégories
          </Link>
        </div>
      </div>

      <form action={updateCategoryAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={category.id} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom" required>
            <input
              name="name"
              defaultValue={category.name}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
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
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="1">Visible</option>
              <option value="0">Cachée</option>
            </select>
          </Field>

          <Field label="Ordre d’affichage">
            <input
              type="number"
              name="sortOrder"
              defaultValue={category.sortOrder}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            name="description"
            defaultValue={category.description ?? ""}
            className="min-h-28 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          />
        </Field>

        <ImageUploadField
          label="Image"
          inputName="imageUrl"
          initialUrl={category.imageUrl ?? ""}
          folder={`categories/${category.id}`}
        />

        <Field label="Parent">
          <select
            name="parentId"
            defaultValue={category.parentId ?? prefillParentId ?? ""}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          >
            <option value="">(Aucun)</option>
            {allCategories
              .filter((c) => c.id !== category.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <div className="flex justify-end">
              <input type="hidden" name="createChildParentId" value={category.id} />
              <button
                type="submit"
                formAction={startSubCategoryFromCategoryAction}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                + Ajouter une sous-catégorie
              </button>
            </div>

            <SortableList
              title={`Sous-catégories (${category.children.length})`}
              description="Glisse-dépose pour définir l’ordre d’affichage sous ce parent."
              items={category.children
                .slice()
                .sort((a, b) => {
                  const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                  if (byOrder !== 0) return byOrder
                  return a.name.localeCompare(b.name, "fr")
                })
                .map((child) => ({
                  id: child.id,
                  title: child.name,
                  subtitle: `/${child.slug}`,
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
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
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
                  editHref: `/admin/produits/${p.id}`,
                  viewHref: `/produits/${p.slug}`,
                }))}
              saveKind="categoryProducts"
              scopeId={category.id}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          >
            Enregistrer
          </button>
          <Link
            href={`/categories/${category.slug}`}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Voir sur le site
          </Link>
        </div>
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
      <span className="mb-1 block text-sm font-medium text-gray-900">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  )
}


