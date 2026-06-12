import "./globals.css"
import Navbar from "@/components/Navbar"
import ConstructionBanner from "@/components/ConstructionBanner"
import PromoModal from "@/components/PromoModal"
import type { Metadata } from "next"
import { getConstructionBannerSettings, getPromoModalSettings, getSiteFontSettings, getSiteImage, SITE_KEYS } from "@/admin/queries/siteSettings"
import { getMetadataBaseUrl } from "@/lib/seo"
import Link from "next/link"
import CookieConsent from "@/components/CookieConsent"
import CookieSettingsButton from "@/components/CookieSettingsButton"
import Analytics from "@/components/Analytics"
import SocialLinks from "@/components/SocialLinks"
import HashScroll from "@/components/HashScroll"
import HashSections from "../components/HashSections"
import { DEFAULT_SITE_FONT_KEY, isSiteFontKey } from "@/lib/siteFonts"
import {
  DM_Sans,
  Inter,
  Lato,
  Merriweather,
  Montserrat,
  Nunito,
  Open_Sans,
  Playfair_Display,
  Poppins,
  Raleway,
  Roboto,
  Source_Sans_3,
} from "next/font/google"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter", weight: ["400", "600", "700"] })
const roboto = Roboto({ subsets: ["latin"], display: "swap", variable: "--font-roboto", weight: ["400", "500", "700"] })
const openSans = Open_Sans({ subsets: ["latin"], display: "swap", variable: "--font-open-sans", weight: ["400", "600", "700"] })
const lato = Lato({ subsets: ["latin"], display: "swap", variable: "--font-lato", weight: ["400", "700"] })
const nunito = Nunito({ subsets: ["latin"], display: "swap", variable: "--font-nunito", weight: ["400", "600", "700"] })
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--font-dm-sans", weight: ["400", "500", "700"] })
const sourceSans3 = Source_Sans_3({ subsets: ["latin"], display: "swap", variable: "--font-source-sans-3", weight: ["400", "600", "700"] })
const poppins = Poppins({ subsets: ["latin"], display: "swap", variable: "--font-poppins", weight: ["400", "500", "600", "700"] })
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", variable: "--font-montserrat", weight: ["400", "500", "600", "700"] })
const raleway = Raleway({ subsets: ["latin"], display: "swap", variable: "--font-raleway", weight: ["400", "600", "700"] })
const merriweather = Merriweather({ subsets: ["latin"], display: "swap", variable: "--font-merriweather", weight: ["400", "700"] })
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair", weight: ["400", "600", "700"] })

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
  manifest: "/manifest.json",
  icons: {
    // Google/desktop
    icon: [
      { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon-256x256.png", sizes: "256x256", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    // iOS
    apple: [{ url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [banner, promo, siteFont, heroBg] = await Promise.all([
    getConstructionBannerSettings(),
    getPromoModalSettings(),
    getSiteFontSettings(),
    getSiteImage(SITE_KEYS.homeHero),
  ])

  const siteFontKey = isSiteFontKey(siteFont?.key) ? siteFont.key : DEFAULT_SITE_FONT_KEY

  return (
    <html
      lang="fr"
      data-rb-font={siteFontKey}
      style={
        heroBg?.src
          ? ({
              ["--rb-bg-image" as unknown as string]: `url("${heroBg.src}")`,
              ["--rb-bg-image-opacity" as unknown as string]: "0.32",
            } as React.CSSProperties)
          : undefined
      }
      className={[
        inter.variable,
        roboto.variable,
        openSans.variable,
        lato.variable,
        nunito.variable,
        dmSans.variable,
        sourceSans3.variable,
        poppins.variable,
        montserrat.variable,
        raleway.variable,
        merriweather.variable,
        playfair.variable,
      ].join(" ")}
    >
      <body className="min-h-screen antialiased flex flex-col">
        {banner?.isVisible ? (
          <ConstructionBanner text={banner.text} textHtml={banner.textHtml} />
        ) : null}
        <Navbar />
        <HashScroll offsetPx={96} />
        <HashSections ids={["accueil", "catalogue", "qui-sommes-nous", "faq", "contact", "projets"]} offsetPx={96} />
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

            {/* Crédit réalisation — mobile first : centré, ligne dédiée sous le footer */}
            <a
              href="https://lc-development.fr"
              target="_blank"
              rel="noopener"
              aria-label="Site réalisé par LC Development"
              className="mt-4 flex items-center justify-center gap-2 border-t border-gray-200/70 pt-4 text-xs text-gray-500 transition-colors hover:text-gray-900"
            >
              <span>Site réalisé par</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/lc-development.webp"
                alt="LC Development"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
                loading="lazy"
                decoding="async"
              />
              <strong className="font-semibold">LC&nbsp;Development</strong>
            </a>
          </div>
        </footer>

        {/* Tracking chargé uniquement après consentement. */}
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  )
}
