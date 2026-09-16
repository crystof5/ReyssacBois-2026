/** Pied de carte : libellé d'action + flèche qui se remplit au survol de la carte (group). */
export default function CardArrow({ label }: { label: string }) {
  return (
    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
      <span className="text-sm font-semibold text-green-800">{label}</span>
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-green-800/20 text-green-800 transition-all duration-300 group-hover:border-green-700 group-hover:bg-green-700 group-hover:text-white"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5">
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 0 1 .75-.75h10.64l-3.72-3.72a.75.75 0 1 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H3.75A.75.75 0 0 1 3 10Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
  )
}
