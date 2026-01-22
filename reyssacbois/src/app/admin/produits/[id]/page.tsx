import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateProduitAction } from "@/admin/actions/produits"
import ImageUploadField from "@/admin/components/ImageUploadField"
import SlugField from "@/admin/components/SlugField"
import ProductCategoriesSelector from "@/admin/components/ProductCategoriesSelector"

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

  const selectedCategoryIds = new Set(product.categories.map((c) => c.categoryId))
  const initialSelectedIds = Array.from(
    new Set([
      ...Array.from(selectedCategoryIds),
      ...(prefillCategoryId ? [prefillCategoryId] : []),
    ]),
  )

  const prefillCategory = prefillCategoryId
    ? categories.find((c) => c.id === prefillCategoryId)
    : undefined

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Éditer le produit
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
          {prefillCategoryId ? (
            <Link
              href={`/admin/categories/${prefillCategoryId}`}
              className="text-sm text-gray-700 hover:underline"
              title={prefillCategory?.name ? `Retour à : ${prefillCategory.name}` : "Retour à la catégorie"}
            >
              ← {prefillCategory?.name ? prefillCategory.name : "Catégorie"}
            </Link>
          ) : null}
          <Link
            href="/admin/produits"
            className="text-sm text-gray-700 hover:underline"
          >
            ← Produits
          </Link>
        </div>
      </div>

      {saved ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Enregistré.
        </div>
      ) : null}

      <form action={updateProduitAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={product.id} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom" required>
            <input
              name="name"
              defaultValue={product.name}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
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
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="1">Visible</option>
              <option value="0">Caché</option>
            </select>
          </Field>

          <Field label="Ordre d’affichage">
            <input
              type="number"
              name="sortOrder"
              defaultValue={product.sortOrder}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            name="description"
            defaultValue={product.description ?? ""}
            className="min-h-28 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          />
        </Field>

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
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </Field>
          <Field label="Longueur">
            <input
              name="length"
              defaultValue={product.length ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </Field>
          <Field label="Essence">
            <input
              name="species"
              defaultValue={product.species ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </Field>
          <Field label="Type">
            <input
              name="type"
              defaultValue={product.type ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </Field>
          <Field label="Norme">
            <input
              name="standard"
              defaultValue={product.standard ?? ""}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </Field>
        </div>

        <Field label="Catégories">
          <ProductCategoriesSelector
            categories={categories}
            initialSelectedIds={initialSelectedIds}
          />
          <p className="mt-2 text-xs text-gray-500">
            Un produit peut appartenir à plusieurs catégories.
          </p>
        </Field>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          >
            Enregistrer
          </button>
          <Link
            href={`/produits/${product.slug}`}
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


