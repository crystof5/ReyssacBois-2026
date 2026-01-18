import { getCategoriesTree } from "@/lib/categories"
import SidebarCategories from "@/components/SidebarCategories"

export default async function ProduitsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategoriesTree()

  return (
    <div className="flex">
      <SidebarCategories categories={categories} />
      <main className="flex-1 px-6 py-6">
        {children}
      </main>
    </div>
  )
}
