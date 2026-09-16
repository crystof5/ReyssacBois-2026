/** Libellé SEO d'un produit : "Nom – Catégorie" (évite la répétition si le nom la contient déjà). */
export function productSeoLabel(productName: string, categoryName?: string) {
  if (!categoryName) return productName
  if (productName.toLowerCase().includes(categoryName.toLowerCase())) return productName
  return `${productName} – ${categoryName}`
}

export function getProductLocalSeo(productName: string, categoryName?: string) {
  const label = productSeoLabel(productName, categoryName)
  return {
    label,
    heading: `${label} à Agen`,
    paragraphs: [
      `${label} : ce produit est disponible chez Reyssac Bois, négociant en bois à Boé, aux portes d'Agen. Notre équipe vous conseille sur le choix, les dimensions et les quantités adaptées à votre projet, que vous soyez professionnel ou particulier.`,
      "Retrait sur place, découpe sur mesure selon les produits et livraison dans l'agglomération d'Agen, le Lot-et-Garonne, le Gers et le Tarn-et-Garonne. De Bordeaux à Toulouse sur devis.",
    ],
  }
}
