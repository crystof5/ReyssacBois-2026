"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          autoComplete="current-password"
          required
        />
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


