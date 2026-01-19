import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateCategoryAction } from "@/admin/actions/categories"
import ImageUploadField from "@/admin/components/ImageUploadField"
import SlugField from "@/admin/components/SlugField"

export default async function AdminCategoryEditPage({
  params,
}: {
  params: Promise<{ id?: string }>
}) {
  const { id } = await params
  if (!id) notFound()

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
    prisma.category.findMany({ orderBy: [{ name: "asc" }] }),
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
        <Link
          href="/admin/categories"
          className="text-sm text-gray-700 hover:underline"
        >
          ← Retour
        </Link>
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
            defaultValue={category.parentId ?? ""}
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
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Sous-catégories ({category.children.length})
            </h3>
            {category.children.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">Aucune.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {category.children
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((child) => (
                    <li key={child.id} className="flex items-center justify-between gap-3">
                      <span className="text-gray-900">{child.name}</span>
                      <Link
                        href={`/admin/categories/${child.id}`}
                        className="text-gray-900 hover:underline"
                      >
                        Éditer →
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Produits ({category.products.length})
            </h3>
            {category.products.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">Aucun.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {category.products
                  .map((p) => p.product)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3">
                      <span className="text-gray-900">{p.name}</span>
                      <Link
                        href={`/admin/produits/${p.id}`}
                        className="text-gray-900 hover:underline"
                      >
                        Éditer →
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
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


