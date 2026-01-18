"use client"

type MediaProps = {
  src?: string | null
  alt: string
  className?: string
}

export default function Media({ src, alt, className = "" }: MediaProps) {
  if (!src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/img/placeholder.svg" alt={alt} className={className} />
  }

  // On utilise <img> (plutôt que next/image) pour éviter toute config de domaines externes.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
      onError={(e) => {
        const img = e.currentTarget
        img.onerror = null
        img.src = "/img/placeholder.svg"
      }}
    />
  )
}


