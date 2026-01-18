import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold mb-6">
        Produits
      </h1>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <li
            key={product.id}
            className="border rounded p-4 hover:shadow"
          >
            <Link
              href={`/produits/${product.slug}`}
              className="font-semibold hover:text-green-700"
            >
              {product.name}
            </Link>

            {product.description && (
              <p className="text-sm text-gray-600 mt-2">
                {product.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
