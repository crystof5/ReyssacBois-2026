export default function LoadingCategory() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-48 rounded bg-gray-200" />
      <div className="mt-6 h-8 w-72 rounded bg-gray-200" />
      <div className="mt-3 h-4 w-full max-w-3xl rounded bg-gray-200" />

      <div className="mt-10">
        <div className="h-6 w-40 rounded bg-gray-200" />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="aspect-[16/10] bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-5/6 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

