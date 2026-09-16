/** Carte Google Maps du dépôt (même intégration que la section contact de l'accueil). */
export default function MapEmbed({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-3xl border border-gray-200/70 bg-white/55 shadow-sm ring-1 ring-black/5 ${className}`}>
      <div className="relative w-full pt-[75%] sm:pt-[56.25%]">
        <iframe
          title="Carte - Reyssac Bois à Boé"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2861.0054045604797!2d0.6584004767006642!3d44.186355417784526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12abb381555554cf%3A0xa1fac795a72fef80!2sReyssac%20Bois!5e0!3m2!1sfr!2sfr!4v1693635316155!5m2!1sfr!2sfr"
          className="absolute inset-0 h-full w-full"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}
