import { S3Client } from "@aws-sdk/client-s3"

type R2Env = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBaseUrl: string
}

function required(name: string, value: string | undefined) {
  const v = (value ?? "").trim()
  if (!v) throw new Error(`Variable manquante: ${name}`)
  return v
}

export function getR2Env(): R2Env {
  return {
    accountId: required("R2_ACCOUNT_ID", process.env.R2_ACCOUNT_ID),
    accessKeyId: required("R2_ACCESS_KEY_ID", process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY", process.env.R2_SECRET_ACCESS_KEY),
    bucket: required("R2_BUCKET", process.env.R2_BUCKET),
    publicBaseUrl: required("R2_PUBLIC_BASE_URL", process.env.R2_PUBLIC_BASE_URL).replace(/\/+$/, ""),
  }
}

let _client: S3Client | null = null

export function getR2Client() {
  if (_client) return _client
  const env = getR2Env()

  _client = new S3Client({
    region: "auto",
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  })

  return _client
}

export function buildR2PublicUrl(key: string) {
  const { publicBaseUrl } = getR2Env()
  const clean = key.replace(/^\/+/, "")
  return `${publicBaseUrl}/${clean}`
}

export function extractKeyFromPublicUrl(publicUrl: string) {
  const u = new URL(publicUrl)
  const key = decodeURIComponent(u.pathname.replace(/^\/+/, ""))
  if (!key) return null
  if (key.includes("..")) return null
  return key
}

