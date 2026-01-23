export const SITE_FONTS = [
  { key: "inter", label: "Inter", cssVar: "--font-inter" },
  { key: "roboto", label: "Roboto", cssVar: "--font-roboto" },
  { key: "openSans", label: "Open Sans", cssVar: "--font-open-sans" },
  { key: "lato", label: "Lato", cssVar: "--font-lato" },
  { key: "nunito", label: "Nunito", cssVar: "--font-nunito" },
  { key: "dmSans", label: "DM Sans", cssVar: "--font-dm-sans" },
  { key: "sourceSans3", label: "Source Sans 3", cssVar: "--font-source-sans-3" },
  { key: "poppins", label: "Poppins", cssVar: "--font-poppins" },
  { key: "montserrat", label: "Montserrat", cssVar: "--font-montserrat" },
  { key: "raleway", label: "Raleway", cssVar: "--font-raleway" },
  { key: "merriweather", label: "Merriweather", cssVar: "--font-merriweather" },
  { key: "playfair", label: "Playfair Display", cssVar: "--font-playfair" },
] as const

export type SiteFontKey = (typeof SITE_FONTS)[number]["key"]

export const DEFAULT_SITE_FONT_KEY: SiteFontKey = "inter"

export function isSiteFontKey(value: unknown): value is SiteFontKey {
  if (typeof value !== "string") return false
  return SITE_FONTS.some((f) => f.key === value)
}

export function getFontCssVarForKey(key: SiteFontKey): string {
  const font = SITE_FONTS.find((f) => f.key === key)
  // fallback safe (dev guard)
  return font?.cssVar ?? SITE_FONTS[0].cssVar
}

export function getFontFamilyStackForKey(key: SiteFontKey): string {
  const cssVar = getFontCssVarForKey(key)
  // Le `--font-...` est injecté par `next/font` (variable). On garde une fallback system.
  return `var(${cssVar}), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif`
}

