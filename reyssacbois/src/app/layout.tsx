import "./globals.css"
import Navbar from "@/components/Navbar"
import ConstructionBanner from "@/components/ConstructionBanner"
import PromoModal from "@/components/PromoModal"
import type { Metadata } from "next"
import { getConstructionBannerSettings, getPromoModalSettings } from "@/admin/queries/siteSettings"

// Les réglages (promo/bannière) viennent de la DB et doivent refléter
// immédiatement les changements admin (sans rebuild). On force donc du SSR.
export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: {
    default: "Reyssac Bois",
    template: "%s | Reyssac Bois",
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

        <footer className="border-t bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/android-chrome-192x192.png"
                  alt="Reyssac Bois"
                  className="h-6 w-6 rounded-full bg-white"
                />
                <p className="font-medium text-gray-900">Reyssac Bois</p>
              </div>
              <p>© {new Date().getFullYear()} Reyssac Bois — Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
