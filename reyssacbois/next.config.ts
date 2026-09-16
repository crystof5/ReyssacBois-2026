import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO : désactive le streaming des métadonnées pour tous les user-agents.
  // Sans ça, <title>/<meta> peuvent être émis après </head> (constaté en prod
  // sur /categories/panneaux et les fiches produits), y compris pour Googlebot.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
