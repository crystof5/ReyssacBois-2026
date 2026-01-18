"use client"

import { useMemo, useState } from "react"

type FormState = {
  name: string
  email: string
  company: string
  phone: string
  subject: string
  message: string
  website: string // honeypot
}

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    if (status === "loading") return false
    if (form.website.trim()) return true // bot => on laisse "submit" sans bloquer visuellement
    if (form.name.trim().length < 2) return false
    if (!isValidEmail(form.email.trim())) return false
    if (form.message.trim().length < 10) return false
    return true
  }, [form, status])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setError(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = (await res.json()) as { ok: boolean; error?: string }

      if (!res.ok || !json.ok) {
        setStatus("error")
        setError(json.error ?? "Erreur lors de l’envoi.")
        return
      }

      setStatus("success")
      setForm(initialState)
    } catch {
      setStatus("error")
      setError("Impossible d’envoyer le message (réseau).")
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {status === "success" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Message envoyé. Nous vous recontactons rapidement.
        </div>
      )}

      {status === "error" && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Honeypot (anti-spam) */}
      <div className="hidden" aria-hidden="true">
        <label>
          Site web
          <input
            value={form.website}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            autoComplete="off"
            tabIndex={-1}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom" required>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            placeholder="Votre nom"
            autoComplete="name"
            required
          />
        </Field>

        <Field label="Email" required>
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            placeholder="vous@exemple.com"
            autoComplete="email"
            inputMode="email"
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Entreprise">
          <input
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            placeholder="Optionnel"
            autoComplete="organization"
          />
        </Field>

        <Field label="Téléphone">
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            placeholder="Optionnel"
            autoComplete="tel"
            inputMode="tel"
          />
        </Field>
      </div>

      <Field label="Sujet">
        <input
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          placeholder="Demande d’info / devis / disponibilité…"
        />
      </Field>

      <Field label="Message" required>
        <textarea
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="min-h-32 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          placeholder="Décrivez votre besoin (dimensions, quantités, délais…)."
          required
        />
      </Field>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-600/30"
      >
        {status === "loading" ? "Envoi en cours…" : "Envoyer"}
      </button>

      <p className="text-xs text-gray-500">
        En envoyant ce formulaire, vous acceptez d’être recontacté(e) au sujet de votre demande.
      </p>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-900">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  )
}


