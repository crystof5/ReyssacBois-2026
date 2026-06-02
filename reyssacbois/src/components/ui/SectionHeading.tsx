import type { ReactNode } from "react"

type HeadingTag = "h1" | "h2" | "h3"

export default function SectionHeading({
  kicker,
  title,
  intro,
  align = "left",
  as = "h2",
  id,
  className = "",
}: {
  kicker?: string
  title: ReactNode
  intro?: ReactNode
  align?: "left" | "center"
  as?: HeadingTag
  id?: string
  className?: string
}) {
  const Tag = as
  const isCenter = align === "center"
  return (
    <div className={`${isCenter ? "text-center" : ""} ${className}`.trim()}>
      {kicker ? (
        <p className={`rb-kicker ${isCenter ? "justify-center" : ""}`.trim()}>{kicker}</p>
      ) : null}
      <Tag
        id={id}
        className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl"
      >
        {title}
      </Tag>
      {intro ? (
        <p className={`mt-3 max-w-2xl text-ink-600 ${isCenter ? "mx-auto" : ""}`.trim()}>{intro}</p>
      ) : null}
    </div>
  )
}
