import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Route "SEO" très crawlée: on autorise le cache Next.
// Note (Next 16 + Turbopack): les exports de config de segment doivent être des littéraux.
export const revalidate = 86400; // 24h

export default function robots(): MetadataRoute.Robots {
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  // En preview/dev, on bloque l'indexation (évite que Google indexe les URLs *.vercel.app).
  if (!isProd) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: ["/"],
        },
      ],
    };
  }

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
  };
}
