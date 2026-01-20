import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"

// Route "SEO" très crawlée: on autorise le cache Next.
// Note (Next 16 + Turbopack): les exports de config de segment doivent être des littéraux.
export const revalidate = 86400 // 24h

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

