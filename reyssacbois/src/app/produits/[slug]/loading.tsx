export default function LoadingProduit() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-48 rounded bg-line" />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="aspect-[4/3] w-full bg-line" />
        </div>
        <div>
          <div className="h-8 w-3/4 rounded bg-line" />
          <div className="mt-3 h-4 w-full rounded bg-line" />
          <div className="mt-2 h-4 w-5/6 rounded bg-line" />

          <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <div className="h-4 w-40 rounded bg-line" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-24 rounded bg-line" />
                  <div className="mt-2 h-4 w-32 rounded bg-line" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <div className="h-10 w-40 rounded bg-line" />
              <div className="h-10 w-40 rounded bg-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

