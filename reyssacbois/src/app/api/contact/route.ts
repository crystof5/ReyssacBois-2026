import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"

type ContactPayload = {
  name?: string
  email?: string
  company?: string
  phone?: string
  subject?: string
  message?: string
  website?: string // honeypot
  recaptchaToken?: string
}

export const runtime = "nodejs"

function isValidEmail(email: string) {
  // simple + robuste pour du formulaire (pas un validateur RFC strict)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeSmtpName(raw: string) {
  const v = (raw || "").trim()
  if (!v) return ""
  // accepte un domaine nu ("reyssacbois.fr") ou une URL ("https://reyssacbois.fr")
  if (/^https?:\/\//i.test(v)) {
    try {
      return new URL(v).hostname
    } catch {
      return v.replace(/^https?:\/\//i, "").split("/")[0] ?? v
    }
  }
  return v.split("/")[0] ?? v
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function splitEmails(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function POST(req: Request) {
  const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

  let data: ContactPayload
  try {
    data = (await req.json()) as ContactPayload
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 })
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined
    const userAgent = req.headers.get("user-agent") || undefined

    const website = (data.website ?? "").trim()
    if (website) {
      // Honeypot rempli => bot
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // reCAPTCHA (v3) — obligatoire quand activé
    const secret = process.env.RECAPTCHA_SECRET_KEY
    const token = (data.recaptchaToken ?? "").trim()

    let verifyJson:
      | {
          success?: boolean
          score?: number
          action?: string
          hostname?: string
          "error-codes"?: string[]
        }
      | null = null

    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "reCAPTCHA non configuré côté serveur." },
        { status: 500 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Validation reCAPTCHA manquante." },
        { status: 400 }
      )
    }

    // Vérification reCAPTCHA (v3)
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    })
    verifyJson = (await verifyRes.json()) as {
      success?: boolean
      score?: number
      action?: string
      hostname?: string
      "error-codes"?: string[]
    }

    if (!verifyJson.success) {
      return NextResponse.json(
        { ok: false, error: "Validation reCAPTCHA refusée." },
        { status: 400 }
      )
    }

    if (verifyJson.action && verifyJson.action !== "contact") {
      return NextResponse.json(
        { ok: false, error: "Validation reCAPTCHA invalide." },
        { status: 400 }
      )
    }

    const allowedHostnames = splitEmails(process.env.RECAPTCHA_ALLOWED_HOSTNAMES).map((h) =>
      h.toLowerCase()
    )
    if (allowedHostnames.length) {
      const hostname = (verifyJson.hostname ?? "").toLowerCase()
      if (!hostname || !allowedHostnames.includes(hostname)) {
        return NextResponse.json(
          { ok: false, error: "Validation reCAPTCHA invalide." },
          { status: 400 }
        )
      }
    }

    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5")
    if (
      Number.isFinite(minScore) &&
      typeof verifyJson.score === "number" &&
      verifyJson.score < minScore
    ) {
      return NextResponse.json(
        { ok: false, error: "Validation anti-spam insuffisante. Réessaie." },
        { status: 400 }
      )
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
  // (On branche l’email via SMTP ci-dessous.)
    console.log("[contact]", {
      requestId,
      name,
      email,
      company: company || undefined,
      phone: phone || undefined,
      subject: subject || undefined,
      message,
    })

    let contactMessageId: string | null = null
    try {
      const created = await prisma.contactMessage.create({
        data: {
          name,
          email,
          message,
          company: company || undefined,
          phone: phone || undefined,
          subject: subject || undefined,
          ip,
          userAgent,
          recaptchaScore: typeof verifyJson?.score === "number" ? verifyJson.score : undefined,
          recaptchaAction: verifyJson?.action || undefined,
          recaptchaHostname: verifyJson?.hostname || undefined,
        },
        select: { id: true },
      })
      contactMessageId = created.id
    } catch (err) {
      // On ne bloque pas l’envoi d’email si la DB a un souci,
      // mais on log pour diagnostiquer.
      console.error("[contact] db_write_failed", { requestId, err })
    }

    const smtpHost = process.env.SMTP_HOST
    const smtpPort = Number(process.env.SMTP_PORT ?? "465")
    const smtpSecure =
      (process.env.SMTP_SECURE ?? "").toLowerCase() === "true" ? true : smtpPort === 465
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const tlsRejectUnauthorized =
      (process.env.SMTP_TLS_REJECT_UNAUTHORIZED ?? "true").toLowerCase() !== "false"
    const smtpName =
      normalizeSmtpName(process.env.SMTP_NAME || "") ||
      normalizeSmtpName(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "") ||
      normalizeSmtpName(req.headers.get("host") || "") ||
      "localhost"

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { ok: false, error: "Email non configuré côté serveur." },
        { status: 500 }
      )
    }

    // Garde-fous de config (évite les combos qui provoquent souvent ECONNRESET)
    if (smtpPort === 587 && smtpSecure) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Configuration SMTP invalide: avec SMTP_PORT=587, mets SMTP_SECURE=false (STARTTLS).",
        },
        { status: 500 }
      )
    }
    if (smtpPort === 465 && !smtpSecure) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Configuration SMTP invalide: avec SMTP_PORT=465, mets SMTP_SECURE=true (TLS implicite).",
        },
        { status: 500 }
      )
    }

    const to = splitEmails(process.env.CONTACT_TO).length
      ? splitEmails(process.env.CONTACT_TO)
      : [smtpUser]
    // CCI (blind carbon copy)
    // - variable demandée: CONTACT_CCI
    // - fallback: CONTACT_CC (compat rétro si déjà configuré)
    const bcc = splitEmails(process.env.CONTACT_CCI || process.env.CONTACT_CC)

    const fromName = process.env.CONTACT_FROM_NAME || "Site ReyssacBois"
    const fromEmail =
      (process.env.CONTACT_FROM_EMAIL || process.env.SMTP_FROM || "").trim() || smtpUser
    const subjectPrefix = process.env.CONTACT_SUBJECT_PREFIX || "Site ReyssacBois"
    const emailSubject = `${subjectPrefix} — ${subject ? subject : "Nouveau message"} (de ${name})`

    const now = new Date()

    const text = [
    `${subjectPrefix} — Nouveau message via le site`,
    "",
    `Nom : ${name}`,
    `Email : ${email}`,
    company ? `Entreprise : ${company}` : null,
    phone ? `Téléphone : ${phone}` : null,
    subject ? `Sujet : ${subject}` : null,
    "",
    "Message :",
    message,
    "",
    "—",
    `Date : ${now.toLocaleString("fr-FR")}`,
    ip ? `IP : ${ip}` : null,
    userAgent ? `User-Agent : ${userAgent}` : null,
  ]
    .filter(Boolean)
    .join("\n")

    const html = `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; line-height:1.5; color:#111;">
    <h2 style="margin:0 0 12px 0; font-size:18px;">${escapeHtml(
      subjectPrefix
    )} — Nouveau message via le site</h2>
    <p style="margin:0 0 12px 0; color:#444;">Vous avez reçu un message depuis le formulaire de contact.</p>

    <table style="border-collapse:collapse; width:100%; max-width:720px;">
      <tbody>
        <tr>
          <td style="padding:8px 10px; border:1px solid #e5e7eb; width:160px; background:#f9fafb;"><b>Nom</b></td>
          <td style="padding:8px 10px; border:1px solid #e5e7eb;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 10px; border:1px solid #e5e7eb; background:#f9fafb;"><b>Email</b></td>
          <td style="padding:8px 10px; border:1px solid #e5e7eb;"><a href="mailto:${escapeHtml(
            email
          )}">${escapeHtml(email)}</a></td>
        </tr>
        ${
          company
            ? `<tr>
          <td style="padding:8px 10px; border:1px solid #e5e7eb; background:#f9fafb;"><b>Entreprise</b></td>
          <td style="padding:8px 10px; border:1px solid #e5e7eb;">${escapeHtml(company)}</td>
        </tr>`
            : ""
        }
        ${
          phone
            ? `<tr>
          <td style="padding:8px 10px; border:1px solid #e5e7eb; background:#f9fafb;"><b>Téléphone</b></td>
          <td style="padding:8px 10px; border:1px solid #e5e7eb;">${escapeHtml(phone)}</td>
        </tr>`
            : ""
        }
        ${
          subject
            ? `<tr>
          <td style="padding:8px 10px; border:1px solid #e5e7eb; background:#f9fafb;"><b>Sujet</b></td>
          <td style="padding:8px 10px; border:1px solid #e5e7eb;">${escapeHtml(subject)}</td>
        </tr>`
            : ""
        }
      </tbody>
    </table>

    <h3 style="margin:16px 0 8px 0; font-size:14px;">Message</h3>
    <div style="white-space:pre-wrap; padding:12px; border:1px solid #e5e7eb; border-radius:8px; background:#fff;">${escapeHtml(
      message
    )}</div>

    <p style="margin:16px 0 0 0; font-size:12px; color:#6b7280;">
      Reçu le ${escapeHtml(now.toLocaleString("fr-FR"))}${
        ip ? ` • IP: ${escapeHtml(ip)}` : ""
      }${userAgent ? ` • UA: ${escapeHtml(userAgent)}` : ""}.
    </p>
  </div>
  `.trim()

    try {
      const transport = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        // IMPORTANT (Orange notamment): hostname utilisé pour EHLO/HELO.
        // Sur Vercel, le hostname par défaut peut être un nom de container et être refusé.
        name: smtpName,
        auth: { user: smtpUser, pass: smtpPass },
        // Sur 587, certains serveurs (dont Orange) exigent STARTTLS
        requireTLS: !smtpSecure && smtpPort === 587,
        tls: { servername: smtpHost, rejectUnauthorized: tlsRejectUnauthorized },
        // évite les requêtes qui "pendent" et font croire à une erreur réseau côté client
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      })

      await transport.sendMail({
        from: { name: fromName, address: fromEmail },
        to,
        bcc: bcc.length ? bcc : undefined,
        replyTo: { name, address: email },
        subject: emailSubject,
        text,
        html,
      })

      if (contactMessageId) {
        try {
          await prisma.contactMessage.update({
            where: { id: contactMessageId },
            data: { emailSentAt: now, emailError: null },
          })
        } catch (err) {
          console.error("[contact] db_update_emailSent_failed", { requestId, err })
        }
      }
    } catch (err) {
      console.error("[contact] email_send_failed", { requestId, err })

      const smtpCode =
        typeof err === "object" && err && "code" in err ? String((err as { code?: unknown }).code) : null
      const smtpResponseCode =
        typeof err === "object" && err && "responseCode" in err
          ? String((err as { responseCode?: unknown }).responseCode)
          : null
      const smtpMessage = err instanceof Error ? err.message : typeof err === "string" ? err : null
      const looksLikeOrangeRefusal =
        typeof smtpMessage === "string" &&
        (smtpMessage.includes("OFR105_") ||
          smtpMessage.toLowerCase().includes("service refused") ||
          smtpMessage.toLowerCase().includes("invalid greeting"))

      if (contactMessageId) {
        try {
          await prisma.contactMessage.update({
            where: { id: contactMessageId },
            data: {
              emailError:
                err instanceof Error
                  ? err.message
                  : typeof err === "string"
                    ? err
                    : "email_send_failed",
            },
          })
        } catch (dbErr) {
          console.error("[contact] db_update_emailError_failed", { requestId, err: dbErr })
        }
      }

      return NextResponse.json(
        {
          ok: false,
          error: [
            "Impossible d’envoyer l’email pour le moment.",
            looksLikeOrangeRefusal
              ? "Astuce: Orange refuse souvent les connexions depuis Vercel (anti-spam). Essaie SMTP_PORT=465 + SMTP_SECURE=true et mets SMTP_NAME=reyssacbois.fr. Sinon, utilise un SMTP transactionnel (Brevo/SendGrid/Mailgun)."
              : null,
            smtpCode ? `Code: ${smtpCode}` : null,
            smtpResponseCode ? `Réponse: ${smtpResponseCode}` : null,
            smtpMessage ? `Détail: ${smtpMessage.slice(0, 180)}` : null,
            `Réf: ${requestId}`,
          ]
            .filter(Boolean)
            .join(" "),
        },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error("[contact] handler_failed", { requestId, err })
    return NextResponse.json(
      { ok: false, error: "Erreur serveur. (Réf: " + requestId + ")" },
      { status: 500 }
    )
  }
}


