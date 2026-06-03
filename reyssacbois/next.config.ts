import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie "standalone" : Next ne copie que le strict nécessaire (serveur + deps tracées)
  // => image Docker minimale et démarrage rapide (idéal Coolify).
  output: "standalone",
};

export default nextConfig;
