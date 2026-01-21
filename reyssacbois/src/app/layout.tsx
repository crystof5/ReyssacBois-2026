import "./globals.css"
import Navbar from "@/components/Navbar"
import ConstructionBanner from "@/components/ConstructionBanner"
import PromoModal from "@/components/PromoModal"
import type { Metadata } from "next"
import { getConstructionBannerSettings, getPromoModalSettings } from "@/admin/queries/siteSettings"
import { getMetadataBaseUrl } from "@/lib/seo"
import Link from "next/link"
import CookieConsent from "@/components/CookieConsent"
import CookieSettingsButton from "@/components/CookieSettingsButton"
import Analytics from "@/components/Analytics"
import SocialLinks from "@/components/SocialLinks"

// Les réglages (promo/bannière) viennent de la DB et doivent refléter
// immédiatement les changements admin (sans rebuild). On force donc du SSR.
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    default: "Reyssac Bois",
    template: "%s | Reyssac Bois",
  },
  description: "Bois de construction, menuiserie et quincaillerie. Reyssac Bois — votre expert en bois depuis 1850.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/img/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/img/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [banner, promo] = await Promise.all([
    getConstructionBannerSettings(),
    getPromoModalSettings(),
  ])

  return (
    <html lang="fr">
      <body className="min-h-screen antialiased flex flex-col">
        {banner?.isVisible ? <ConstructionBanner text={banner.text} /> : null}
        <Navbar />
        <PromoModal promo={promo} />
        <div className="flex-1">{children}</div>

        <footer className="mt-8 border-t border-gray-200/70 bg-white/60 backdrop-blur">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/android-chrome-192x192.png"
                  alt="Reyssac Bois"
                  className="h-8 w-8 rounded-full bg-white shadow-sm ring-1 ring-black/5"
                />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">Reyssac Bois</p>
                  <p className="text-xs text-gray-600 leading-tight">
                    <a className="hover:underline underline-offset-4" href="tel:0553961597">05 53 96 15 97</a>
                    <span className="mx-2 text-gray-300">•</span>
                    <a className="hover:underline underline-offset-4" href="mailto:reyssacbois@orange.fr">reyssacbois@orange.fr</a>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600 sm:justify-end">
                <Link className="hover:text-gray-900 underline-offset-4 hover:underline" href="/mentions-legales">
                  Mentions légales
                </Link>
                <Link className="hover:text-gray-900 underline-offset-4 hover:underline" href="/politique-de-confidentialite">
                  Confidentialité & cookies
                </Link>
                <CookieSettingsButton className="hover:text-gray-900 underline-offset-4 hover:underline">
                  Cookies
                </CookieSettingsButton>
                <SocialLinks />
                <span className="text-gray-400">|</span>
                <span className="text-xs text-gray-500">
                  © {new Date().getFullYear()} Reyssac Bois
                </span>
              </div>
            </div>
          </div>
        </footer>

        {/* Tracking chargé uniquement après consentement. */}
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  )
}
