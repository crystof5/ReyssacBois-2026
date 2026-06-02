"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import {
  dispatchConsentChange,
  onConsentChange,
  readAnalyticsConsent,
  updateGtagConsent,
  writeAnalyticsConsent,
  type AnalyticsStorageConsent,
} from "@/lib/cookieConsent"

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ")
}

export default function CookieConsent() {
  const pathname = usePathname()
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

  const disabledForThisPath = useMemo(() => {
    // On évite d'afficher la bannière dans l'admin.
    return pathname?.startsWith("/admin") ?? false
  }, [pathname])

  const [consent, setConsent] = useState<AnalyticsStorageConsent | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false)

  useEffect(() => {
    if (disabledForThisPath) return
    const c = readAnalyticsConsent()
    setConsent(c)
    setAnalyticsEnabled(c === "granted")
    return onConsentChange((v) => {
      setConsent(v)
      setAnalyticsEnabled(v === "granted")
    })
  }, [disabledForThisPath])

  useEffect(() => {
    if (disabledForThisPath) return
    const openListener = () => setShowSettings(true)
    window.addEventListener("rb:open-cookie-settings", openListener)
    return () => window.removeEventListener("rb:open-cookie-settings", openListener)
  }, [disabledForThisPath])

  if (disabledForThisPath) return null

  const persist = (value: AnalyticsStorageConsent) => {
    writeAnalyticsConsent(value)
    dispatchConsentChange(value)
    updateGtagConsent(measurementId, value)
    setConsent(value)
  }

  const acceptAll = () => {
    persist("granted")
    setShowSettings(false)
  }

  const refuseAll = () => {
    persist("denied")
    setShowSettings(false)
  }

  const saveSettings = () => {
    persist(analyticsEnabled ? "granted" : "denied")
    setShowSettings(false)
  }

  const shouldShowBanner = consent === null

  return (
    <>
      {shouldShowBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
          <div className="mx-auto w-full max-w-7xl overflow-hidden rounded border border-line bg-surface shadow-[var(--shadow-pop)]">
            <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0 space-y-1 break-words">
                <p className="text-sm font-semibold text-ink">
                  Cookies & confidentialité
                </p>
                <p className="text-sm text-ink-600 break-words">
                  Nous utilisons des cookies <span className="font-medium">uniquement</span> pour mesurer l’audience (Google Analytics), si vous l’acceptez.
                  Vous pouvez accepter, refuser ou personnaliser à tout moment.
                </p>
                <p className="text-xs text-ink-400 break-words">
                  <Link className="underline underline-offset-2 hover:text-ink-600" href="/politique-de-confidentialite">
                    En savoir plus
                  </Link>
                  {" · "}
                  <Link className="underline underline-offset-2 hover:text-ink-600" href="/mentions-legales">
                    Mentions légales
                  </Link>
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-forest-700/30"
                >
                  Personnaliser
                </button>
                <button
                  type="button"
                  onClick={refuseAll}
                  className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-forest-700/30"
                >
                  Tout refuser
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex items-center justify-center rounded-lg bg-forest-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-700/40"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showSettings ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer la fenêtre"
            onClick={() => setShowSettings(false)}
          />

          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-3 sm:p-6">
            <div className="w-full sm:max-w-xl rounded-2xl border border-line bg-white shadow-xl ring-1 ring-black/5">
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">Préférences cookies</p>
                    <p className="mt-1 text-sm text-ink-600">
                      Choisissez les cookies que vous souhaitez autoriser. Les cookies essentiels (techniques) sont nécessaires au bon fonctionnement du site.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-ink-400 hover:bg-surface-2 hover:text-ink-600 focus:outline-none focus:ring-2 focus:ring-forest-700/30"
                    onClick={() => setShowSettings(false)}
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-xl border border-line p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-ink">Essentiels</p>
                        <p className="mt-1 text-sm text-ink-600">
                          Nécessaires au fonctionnement du site (navigation, sécurité).
                        </p>
                      </div>
                      <span className="rb-badge">Toujours actifs</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-ink">Mesure d’audience</p>
                        <p className="mt-1 text-sm text-ink-600">
                          Google Analytics (GA4) pour comprendre les visites et améliorer le site.
                        </p>
                      </div>

                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={analyticsEnabled}
                          onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                        />
                        <span
                          className={classNames(
                            "h-6 w-11 rounded-full bg-line-strong transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-forest-700/40",
                            analyticsEnabled && "bg-forest-700",
                          )}
                        />
                        <span
                          className={classNames(
                            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                            analyticsEnabled && "translate-x-5",
                          )}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={refuseAll}
                      className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-forest-700/30"
                    >
                      Tout refuser
                    </button>
                    <button
                      type="button"
                      onClick={acceptAll}
                      className="inline-flex items-center justify-center rounded-lg bg-forest-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-700/40"
                    >
                      Tout accepter
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={saveSettings}
                    className="inline-flex items-center justify-center rounded border border-forest-700 bg-forest-700 px-4 py-2 text-sm font-medium text-white hover:bg-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-700/40"
                  >
                    Enregistrer
                  </button>
                </div>

                <p className="mt-4 text-xs text-ink-400">
                  Plus d’infos:{" "}
                  <Link className="underline underline-offset-2 hover:text-ink-600" href="/politique-de-confidentialite">
                    politique de confidentialité & cookies
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

