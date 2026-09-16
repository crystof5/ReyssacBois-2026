/** Visuel de remplacement quand une catégorie / un produit n'a pas de photo. */
export default function WoodPlaceholder({
  label,
  className = "",
}: {
  label: string
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#efe4d2] via-[#e2cfb1] to-[#cfb38b] ${className}`}
    >
      {/* Veinage bois */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full text-[#8a6a3f] opacity-[0.22]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M0 22 C80 10 140 40 220 26 S340 12 400 30" />
        <path d="M0 52 C70 44 150 70 230 56 S350 40 400 60" />
        <path d="M0 86 C90 72 160 104 250 90 S330 70 400 92" />
        <path d="M0 118 C60 110 120 96 190 112 C250 126 300 150 400 124" />
        <path d="M0 150 C100 136 170 168 240 154 S360 140 400 158" />
        <path d="M0 184 C80 172 150 198 230 186 S340 170 400 190" />
        <path d="M0 216 C90 206 160 230 250 218 S350 204 400 222" />
      </svg>

      <div className="relative flex flex-col items-center gap-2 text-[#6b4f2a]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/android-chrome-192x192.png"
          alt=""
          width={72}
          height={72}
          loading="lazy"
          className="h-14 w-14 sm:h-[72px] sm:w-[72px] rounded-full bg-white p-1 shadow-[0_6px_18px_-8px_rgba(80,55,20,0.55)] ring-1 ring-[#8a6a3f]/20"
        />
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] opacity-75">Photo à venir</span>
      </div>
    </div>
  )
}
