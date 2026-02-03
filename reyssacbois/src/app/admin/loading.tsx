export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 rounded-2xl border border-white/25 bg-white/75 p-3 text-sm text-gray-800 shadow-sm ring-1 ring-black/5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-700"
            aria-hidden
          />
          <p className="font-medium">Chargement de l’administration…</p>
        </div>
      </div>
      <div className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="h-6 w-44 rounded bg-gray-200/70" />
            <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-200/60" />
          </div>
          <div className="h-9 w-28 rounded-full bg-gray-200/60" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/20 bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur"
          >
            <div className="h-4 w-40 rounded bg-gray-200/70" />
            <div className="mt-3 h-3 w-full rounded bg-gray-200/60" />
            <div className="mt-2 h-3 w-5/6 rounded bg-gray-200/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
