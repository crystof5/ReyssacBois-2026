import { getCategoriesTree } from "@/lib/categories"
import SidebarCategories from "@/components/SidebarCategories"

export default async function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategoriesTree()

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <SidebarCategories categories={categories} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
