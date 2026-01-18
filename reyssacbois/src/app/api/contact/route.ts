import { NextResponse } from "next/server"

type ContactPayload = {
  name?: string
  email?: string
  company?: string
  phone?: string
  subject?: string
  message?: string
  website?: string // honeypot
}

function isValidEmail(email: string) {
  // simple + robuste pour du formulaire (pas un validateur RFC strict)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  let data: ContactPayload
  try {
    data = (await req.json()) as ContactPayload
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 })
  }

  const website = (data.website ?? "").trim()
  if (website) {
    // Honeypot rempli => bot
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const name = (data.name ?? "").trim()
  const email = (data.email ?? "").trim()
  const message = (data.message ?? "").trim()
  const subject = (data.subject ?? "").trim()
  const company = (data.company ?? "").trim()
  const phone = (data.phone ?? "").trim()

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Nom trop court" }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Email invalide" }, { status: 400 })
  }
  if (message.length < 10) {
    return NextResponse.json({ ok: false, error: "Message trop court" }, { status: 400 })
  }

  // Pour l’instant on ne persiste pas : on log côté serveur.
  // (On pourra brancher un email / DB ensuite.)
  console.log("[contact]", {
    name,
    email,
    company: company || undefined,
    phone: phone || undefined,
    subject: subject || undefined,
    message,
  })

  return NextResponse.json({ ok: true }, { status: 200 })
}


