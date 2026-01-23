declare module "sanitize-html" {
  export type Attributes = Record<string, string>

  export type TagTransform = (
    tagName: string,
    attribs: Attributes,
  ) => { tagName: string; attribs: Attributes }

  export type SanitizeHtmlOptions = {
    allowedTags?: string[]
    allowedAttributes?: Record<string, string[]>
    allowedSchemes?: string[]
    allowProtocolRelative?: boolean
    allowedStyles?: Record<string, Record<string, RegExp[]>>
    transformTags?: Record<string, TagTransform>
  }

  export default function sanitizeHtml(html: string, options?: SanitizeHtmlOptions): string
}

