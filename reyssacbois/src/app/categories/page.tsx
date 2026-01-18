import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function CategoriesIndexPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Catégories
      </h1>

      <ul className="grid md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <li
            key={category.id}
            className="border rounded-lg p-6 hover:shadow"
          >
            <Link
              href={`/categories/${category.slug}`}
              className="font-semibold text-green-700"
            >
              {category.name}
            </Link>

            {category.description && (
              <p className="text-sm text-gray-500 mt-2">
                {category.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
