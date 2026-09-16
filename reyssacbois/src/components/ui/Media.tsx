"use client"

import { useState } from "react"
import WoodPlaceholder from "@/components/ui/WoodPlaceholder"

type MediaProps = {
  src?: string | null
  alt: string
  className?: string
}

export default function Media({ src, alt, className = "" }: MediaProps) {
  const [failed, setFailed] = useState(false)

  // Pas de photo (ou image cassée) : visuel bois plutôt qu'une icône "image" générique.
  if (!src || failed || src.includes("placeholder.svg")) {
    return <WoodPlaceholder label={alt} className={`h-full w-full ${className}`} />
  }

  // On utilise <img> (plutôt que next/image) pour éviter toute config de domaines externes.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
