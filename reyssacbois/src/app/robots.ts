import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"

export const runtime = "nodejs"
export const preferredRegion = ["fra1"]
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/login",
          "/login/",
          "/api/admin",
          "/api/admin/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}

