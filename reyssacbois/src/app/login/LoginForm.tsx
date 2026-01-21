"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    if (status === "loading") return false
    if (!email.trim()) return false
    if (!password) return false
    return true
  }, [email, password, status])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const json: unknown = await res.json().catch(() => null)

      if (!res.ok || !json || typeof json !== "object" || (json as { ok?: boolean }).ok !== true) {
        setStatus("error")
        setError("Identifiants invalides.")
        return
      }

      router.replace(redirectTo)
      router.refresh()
    } catch {
      setStatus("error")
      setError("Impossible de se connecter. Réessaie.")
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {status === "error" && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-900">
          Email
        </span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          autoComplete="email"
          required
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-900">
          Mot de passe
        </span>
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-11 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/30"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                <path
                  d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                <path
                  d="M3 3l18 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M10.6 10.6a2.5 2.5 0 0 0 3.54 3.54"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M6.4 6.4C3.9 8.2 2.5 10.5 2.5 12c0 0 3.5 7 9.5 7 2.1 0 4-.6 5.5-1.5M9.2 4.8A9.8 9.8 0 0 1 12 5c6 0 9.5 7 9.5 7 0 0-1.2 2.4-3.4 4.3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-600/30"
      >
        {status === "loading" ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  )
}


