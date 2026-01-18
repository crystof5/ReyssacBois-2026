import Image from "next/image"

export default function AppImage({
  src,
  alt,
  className,
  sizes,
}: {
  src?: string | null
  alt: string
  className?: string
  sizes?: string
}) {
  if (!src) {
    return (
      <div
        className={
          className ??
          "bg-gradient-to-br from-emerald-50 to-emerald-100"
        }
        aria-label={alt}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "100vw"}
      className={className ?? "object-cover"}
      unoptimized
    />
  )
}


