"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import {
  onConsentChange,
  readAnalyticsConsent,
  type AnalyticsStorageConsent,
} from "@/lib/cookieConsent"

export default function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  const [consent, setConsent] = useState<AnalyticsStorageConsent | null>(null)

  useEffect(() => {
    setConsent(readAnalyticsConsent())
    return onConsentChange((v) => setConsent(v))
  }, [])

  // Pas d'ID GA => rien à faire.
  if (!measurementId) return null

  // Par défaut: pas de tracking tant qu'on n'a pas de choix explicite.
  const canTrack = consent === "granted"

  return (
    <>
      {/* Stub + consentement par défaut "denied" (ne charge rien, ne dépose pas de cookie). */}
      <Script id="rb-gtag-consent-default" strategy="beforeInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
});
`}
      </Script>

      {canTrack ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
            strategy="afterInteractive"
          />
          <Script id="rb-gtag-init" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('consent', 'update', { 'analytics_storage': 'granted' });
gtag('config', '${measurementId}', {
  anonymize_ip: true,
  send_page_view: true
});
`}
          </Script>
        </>
      ) : null}

      {/* Si l'utilisateur refuse (ou retire son consentement) après coup. */}
      {!canTrack && consent === "denied" ? (
        <Script id="rb-gtag-deny" strategy="afterInteractive">
          {`
try {
  window['ga-disable-${measurementId}'] = true;
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { 'analytics_storage': 'denied' });
  }
} catch {}
`}
        </Script>
      ) : null}
    </>
  )
}

