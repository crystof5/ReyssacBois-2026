import { prisma } from "@/lib/prisma"
import Breadcrumb from "@/components/Breadcrumb"
import CategoryCard from "@/components/CategoryCard"

export default async function CategoriesIndexPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })

  return (
    <div>
      <Breadcrumb items={[{ id: "categories", name: "Catégories", href: "/categories" }]} />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Catégories
      </h1>
      <p className="mt-2 text-gray-600">
        Parcourez nos familles de produits.
      </p>

      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
          </li>
        ))}
      </ul>
    </div>
  )
}
