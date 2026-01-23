import React from "react"

export default function RichText({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  const safe = (html ?? "").trim()
  if (!safe) return null
  return (
    <div
      className={[
        "leading-relaxed",
        "[&_p]:my-0 [&_p+p]:mt-3",
        "[&_strong]:font-extrabold [&_strong]:text-gray-900",
        "[&_em]:italic",
        "[&_u]:underline",
        "[&_a]:font-extrabold [&_a]:text-green-800 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-green-900",
        "[&_ul]:my-0 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:my-1",
        "[&_ol]:my-0 [&_ol]:pl-5 [&_ol]:list-decimal",
        className ?? "",
      ].join(" ")}
      // Le HTML est déjà nettoyé côté serveur lors de la sauvegarde.
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}

