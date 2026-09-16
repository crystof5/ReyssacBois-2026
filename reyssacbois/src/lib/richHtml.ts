import sanitizeHtml from "sanitize-html"

/** Nettoie le HTML produit par l'éditeur riche de l'admin (même politique que les contenus d'accueil). */
export function sanitizeRichTextHtml(input: string) {
  const clean = sanitizeHtml(input ?? "", {
    allowedTags: ["p", "br", "strong", "em", "u", "span", "a", "ul", "ol", "li"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    allowedStyles: {
      span: {
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = String(attribs.href ?? "").trim()
        const isInternal = href.startsWith("/")
        const safeHref =
          isInternal || /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:") ? href : ""
        return {
          tagName,
          attribs: {
            href: safeHref,
            ...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" }),
          },
        }
      },
    },
  })
  // Un éditeur vide renvoie "<p></p>".
  return clean.replace(/^(<p>\s*<\/p>)+$/, "").trim()
}

export function richHtmlToPlainText(html: string) {
  const withNewlines = (html ?? "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n\n")
    .replace(/<\/\s*li\s*>/gi, "\n")
  const stripped = sanitizeHtml(withNewlines, { allowedTags: [], allowedAttributes: {} })
  return stripped.replace(/\n{3,}/g, "\n\n").trim()
}

export function escapeHtml(s: string) {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

/** Paragraphes + liste à puces -> HTML compatible avec l'éditeur riche. */
export function toRichHtml(paragraphs: string[], list?: string[]) {
  const ps = paragraphs.filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`)
  const ul = list?.length ? `<ul>${list.map((li) => `<li><p>${escapeHtml(li)}</p></li>`).join("")}</ul>` : ""
  return ps.join("") + ul
}
