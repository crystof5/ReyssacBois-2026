"use client"

export default function CookieSettingsButton({
  className = "",
  children = "Gérer mes cookies",
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("rb:open-cookie-settings"))}
    >
      {children}
    </button>
  )
}

