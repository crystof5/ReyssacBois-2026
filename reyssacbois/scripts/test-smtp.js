import nodemailer from "nodemailer"

function required(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

async function main() {
  const host = required("SMTP_HOST")
  const port = Number(process.env.SMTP_PORT ?? "465")
  const secure =
    (process.env.SMTP_SECURE ?? "").toLowerCase() === "true" ? true : port === 465
  const user = required("SMTP_USER")
  const pass = required("SMTP_PASS")
  const tlsRejectUnauthorized =
    (process.env.SMTP_TLS_REJECT_UNAUTHORIZED ?? "true").toLowerCase() !== "false"

  if (port === 587 && secure) {
    throw new Error("Config SMTP invalide: SMTP_PORT=587 => SMTP_SECURE=false (STARTTLS).")
  }
  if (port === 465 && !secure) {
    throw new Error("Config SMTP invalide: SMTP_PORT=465 => SMTP_SECURE=true (TLS implicite).")
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: !secure && port === 587,
    tls: { servername: host, rejectUnauthorized: tlsRejectUnauthorized },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })

  try {
    await transport.verify()
    console.log("SMTP OK:", { host, port, secure, user })
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? err.code : undefined
    const responseCode =
      typeof err === "object" && err && "responseCode" in err ? err.responseCode : undefined
    const message = err instanceof Error ? err.message : String(err)
    console.error("SMTP FAILED:", { host, port, secure, user, code, responseCode, message })
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

