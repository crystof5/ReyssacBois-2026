import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Route "SEO" très crawlée: on autorise le cache Next.
// Note (Next 16 + Turbopack): les exports de config de segment doivent être des littéraux.
export const revalidate = 86400; // 24h

export default function robots(): MetadataRoute.Robots {
  // Permet de bloquer l'indexation d'un environnement (ex: preview Coolify) qui tourne
  // pourtant en NODE_ENV=production. Mettre SITE_NOINDEX=1 sur la preview.
  const forceNoindex =
    process.env.SITE_NOINDEX === "1" || process.env.SITE_NOINDEX === "true";

  const isProd =
    !forceNoindex &&
    (process.env.VERCEL_ENV === "production" ||
      process.env.NODE_ENV === "production");

  // En preview/dev (ou si SITE_NOINDEX), on bloque l'indexation.
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
