import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"

export const runtime = "nodejs"
export const preferredRegion = ["fra1"]
// Route "SEO" très crawlée: on autorise le cache Next.
export const revalidate = 60 * 60 * 24 // 24h

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

