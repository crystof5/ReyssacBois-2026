"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.replace("/")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-60"
    >
      {loading ? "Déconnexion…" : "Se déconnecter"}
    </button>
  )
}


