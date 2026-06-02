"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type NavItem = { label: string; href: string; exact?: boolean }

const DASHBOARD: NavItem = { label: "Tableau de bord", href: "/admin", exact: true }

const CONTENT: NavItem[] = [
  { label: "Partie haute + police", href: "/admin/home/haut" },
  { label: "Une histoire de famille", href: "/admin/home/famille" },
  { label: "Catalogue (accueil)", href: "/admin/home/catalogue" },
  { label: "À propos", href: "/admin/home/a-propos" },
  { label: "Contact — Infos", href: "/admin/home/contact" },
  { label: "Projets (carrousel)", href: "/admin/home/projets" },
  { label: "FAQ", href: "/admin/home/faq" },
  { label: "Promo (modale)", href: "/admin/home/promo" },
  { label: "Bannière construction", href: "/admin/home/banniere" },
  { label: "Tout-en-un", href: "/admin/home/complet" },
]

const CATALOG: NavItem[] = [
  { label: "Catégories", href: "/admin/categories" },
  { label: "Produits", href: "/admin/produits" },
  { label: "Import", href: "/admin/import" },
]

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate?: () => void
}) {
  const active = isActive(pathname, item)
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`block truncate rounded px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-forest-700 font-semibold text-white"
          : "text-ink hover:bg-surface-2"
      }`}
    >
      {item.label}
    </Link>
  )
}

function NavGroups({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-5">
      <NavLink item={DASHBOARD} pathname={pathname} onNavigate={onNavigate} />

      <div>
        <p className="rb-eyebrow px-3">Contenu du site</p>
        <ul className="mt-2 space-y-0.5">
          {CONTENT.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="rb-eyebrow px-3">Catalogue</p>
        <ul className="mt-2 space-y-0.5">
          {CATALOG.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname() ?? ""
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrollYRef = useRef(0)

  // Ferme le drawer à la navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Escape pour fermer
  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen])

  // Verrouille le scroll derrière le drawer (iOS-safe)
  useEffect(() => {
    if (!mobileOpen) return
    const html = document.documentElement
    const body = document.body
    scrollYRef.current = window.scrollY || window.pageYOffset || 0

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
    }

    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollYRef.current}px`
    body.style.width = "100%"

    return () => {
      html.style.overflow = prev.htmlOverflow
      body.style.overflow = prev.bodyOverflow
      body.style.position = prev.bodyPosition
      body.style.top = prev.bodyTop
      body.style.width = prev.bodyWidth
      window.scrollTo(0, scrollYRef.current)
    }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile: déclencheur */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rb-btn rb-btn-secondary w-full justify-start"
          aria-label="Ouvrir le menu d'administration"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Menu d&apos;administration
        </button>
      </div>

      {/* Desktop: sidebar fixe */}
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="rb-surface p-3 md:sticky md:top-6">
          <NavGroups pathname={pathname} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="absolute left-0 top-0 flex h-[100dvh] w-[85vw] max-w-sm flex-col border-r border-line bg-surface shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center justify-between border-b border-line p-4">
              <p className="font-display font-bold text-ink">Administration</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-forest-700/40"
              >
                Fermer
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4" style={{ WebkitOverflowScrolling: "touch" }}>
              <NavGroups pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
