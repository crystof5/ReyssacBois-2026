"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"

type SearchCategory = {
  id: string
  name: string
  slug: string
  isVisible: boolean
  parent: { name: string; slug: string } | null
}

type SearchProduct = {
  id: string
  name: string
  slug: string
  isVisible: boolean
  section: string | null
  length: string | null
  width: string | null
  type: string | null
  categories: { category: { name: string; slug: string } }[]
}

type SearchApiResponse =
  | { ok: true; q: string; categories: SearchCategory[]; products: SearchProduct[] }
  | { ok: false; error: string }

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded-lg border px-2.5 py-2 text-sm font-semibold",
        active
          ? "border-green-300 bg-green-50 text-green-900"
          : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({
  inputName,
  initialHtml,
  placeholder,
  helperText,
}: {
  inputName: string
  initialHtml: string
  placeholder?: string
  helperText?: string
}) {
  const [html, setHtml] = useState(initialHtml ?? "")
  const [showLinkPanel, setShowLinkPanel] = useState(false)
  const [linkHref, setLinkHref] = useState("")
  const [linkError, setLinkError] = useState<string | null>(null)
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null)

  // Recherche “lien interne” (produit/catégorie) via /api/search
  const [internalQ, setInternalQ] = useState("")
  const [internalEnabled, setInternalEnabled] = useState(false)
  const internalDebounced = useDebouncedValue(internalQ, 220)
  const [internalLoading, setInternalLoading] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [internalCats, setInternalCats] = useState<SearchCategory[]>([])
  const [internalProds, setInternalProds] = useState<SearchProduct[]>([])
  const internalAbortRef = useRef<AbortController | null>(null)
  const internalCacheRef = useRef<Map<string, { c: SearchCategory[]; p: SearchProduct[] }>>(new Map())

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class:
            "font-extrabold text-green-800 underline underline-offset-4 hover:text-green-900",
        },
      }),
    ],
    [],
  )

  const editor = useEditor({
    // Next.js (App Router) peut SSR les client components -> TipTap demande d'expliciter ceci
    // pour éviter des mismatches d'hydratation.
    immediatelyRender: false,
    extensions,
    content: initialHtml || "",
    onUpdate({ editor }) {
      setHtml(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          [
            "min-h-28 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-600/20",
            // Important: Tailwind reset enlève les styles de listes dans le contentEditable.
            // On ré-applique un rendu clair dans l’éditeur.
            "[&_p]:my-0 [&_p+p]:mt-3",
            "[&_ul]:my-0 [&_ul]:pl-5 [&_ul]:list-disc",
            "[&_ol]:my-0 [&_ol]:pl-5 [&_ol]:list-decimal",
            "[&_li]:my-1",
          ].join(" "),
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    // si la valeur initiale change (rare), on la recharge
    if ((initialHtml ?? "") !== (editor.getHTML() ?? "")) {
      editor.commands.setContent(initialHtml || "", { emitUpdate: false })
      setHtml(initialHtml || "")
    }
  }, [editor, initialHtml])

  // Recherche de liens internes (produits / catégories)
  // IMPORTANT: doit être déclaré AVANT tout return conditionnel pour respecter l'ordre des hooks React.
  const internalTrimmed = internalDebounced.trim()
  const internalHasQuery = internalTrimmed.length >= 2
  useEffect(() => {
    if (!showLinkPanel) return
    if (!internalEnabled) return
    if (!internalHasQuery) {
      setInternalCats([])
      setInternalProds([])
      setInternalError(null)
      setInternalLoading(false)
      if (internalAbortRef.current) internalAbortRef.current.abort()
      return
    }

    const key = internalTrimmed.toLowerCase()
    const cached = internalCacheRef.current.get(key)
    if (cached) {
      setInternalCats(cached.c)
      setInternalProds(cached.p)
      setInternalError(null)
      setInternalLoading(false)
      return
    }

    const controller = new AbortController()
    if (internalAbortRef.current) internalAbortRef.current.abort()
    internalAbortRef.current = controller

    setInternalLoading(true)
    setInternalError(null)

    const url = `/api/search?q=${encodeURIComponent(internalTrimmed)}&limit=8&admin=1`
    fetch(url, { signal: controller.signal })
      .then((r) => r.json() as Promise<SearchApiResponse>)
      .then((json) => {
        if (!json || typeof json !== "object") throw new Error("Réponse invalide")
        if (json.ok !== true) throw new Error("Recherche indisponible.")
        internalCacheRef.current.set(key, { c: json.categories, p: json.products })
        setInternalCats(json.categories)
        setInternalProds(json.products)
        setInternalError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return
        setInternalCats([])
        setInternalProds([])
        setInternalError(e instanceof Error ? e.message : "Recherche indisponible.")
      })
      .finally(() => setInternalLoading(false))
  }, [internalEnabled, internalHasQuery, internalTrimmed, showLinkPanel])

  if (!editor) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-600">
        Chargement de l’éditeur…
      </div>
    )
  }

  const openLinkPanel = () => {
    const prev = (editor.getAttributes("link").href as string | undefined) ?? ""
    setLinkHref(prev)
    setLinkError(null)
    setInternalError(null)
    setInternalLoading(false)
    setInternalCats([])
    setInternalProds([])
    setInternalQ("")
    setInternalEnabled(false)
    if (internalAbortRef.current) internalAbortRef.current.abort()
    // On sauvegarde la sélection pour pouvoir ré-appliquer le lien sans la perdre.
    const sel = editor.state.selection
    savedSelectionRef.current = { from: sel.from, to: sel.to }
    setShowLinkPanel(true)
  }

  const normalizeHref = (raw: string) => raw.trim()

  const isAllowedHref = (href: string) => {
    if (!href) return true
    if (href.startsWith("/")) return true
    if (/^https?:\/\//i.test(href)) return true
    if (/^mailto:/i.test(href)) return true
    if (/^tel:/i.test(href)) return true
    return false
  }

  const applyLink = ({
    href,
    insertTextIfEmptySelection,
  }: {
    href: string
    insertTextIfEmptySelection?: string
  }) => {
    const v = normalizeHref(href)
    setLinkError(null)

    if (!isAllowedHref(v)) {
      setLinkError("Lien invalide. Utilise https://…, /page, mailto:, tel:.")
      return
    }

    // Restaure la sélection (pour permettre “clique ici” -> lien sur “ici”).
    const saved = savedSelectionRef.current
    if (saved) editor.commands.setTextSelection(saved)

    const curSel = editor.state.selection
    const hasSelection = curSel.to > curSel.from

    // Si rien n'est sélectionné, on peut soit refuser (URL manuelle), soit insérer un texte cliquable (lien interne).
    if (!hasSelection && !editor.isActive("link")) {
      const label = (insertTextIfEmptySelection ?? "").trim()
      if (!label) {
        setLinkError("Sélectionne d’abord un mot/texte dans l’éditeur, puis clique “Appliquer”.")
        return
      }
      if (!v) {
        setLinkError("Choisis un lien interne (produit/catégorie) ou saisis une URL.")
        return
      }
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: label,
          marks: [{ type: "link", attrs: { href: v } }],
        } as any)
        .run()

      setShowLinkPanel(false)
      savedSelectionRef.current = null
      return
    }

    if (!v) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: v }).run()
    }

    setShowLinkPanel(false)
    savedSelectionRef.current = null
  }

  const removeLink = () => {
    const saved = savedSelectionRef.current
    if (saved) editor.commands.setTextSelection(saved)
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setShowLinkPanel(false)
    setLinkHref("")
    setLinkError(null)
    savedSelectionRef.current = null
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
      {/* Valeur envoyée au serveur */}
      <input type="hidden" name={inputName} value={html} />

      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton
          title="Gras"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="Italique"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          title="Souligné"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </ToolbarButton>
        <ToolbarButton
          title="Liste à puces"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Liste
        </ToolbarButton>
        <ToolbarButton
          title="Lien"
          active={editor.isActive("link")}
          onClick={openLinkPanel}
        >
          Lien
        </ToolbarButton>

        <label className="ml-1 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm font-semibold text-gray-900">
          Couleur
          <input
            type="color"
            value={(editor.getAttributes("textStyle")?.color as string | undefined) ?? "#111827"}
            onChange={(e) => editor.chain().focus().setColor(e.currentTarget.value).run()}
            className="h-6 w-10 cursor-pointer rounded"
            aria-label="Couleur du texte"
          />
        </label>

        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          onClick={() => {
            editor.chain().focus().unsetAllMarks().clearNodes().run()
            editor.commands.setContent("", { emitUpdate: false })
            setHtml("")
          }}
        >
          Réinitialiser
        </button>
      </div>

      {showLinkPanel ? (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3">
            <p className="text-xs font-semibold text-gray-900">Lien interne (produit / catégorie)</p>
            <p className="mt-1 text-xs text-gray-600">
              Tape au moins 2 caractères, puis clique un résultat pour insérer le lien (sur la sélection, ou en insérant le nom si rien n’est sélectionné).
            </p>

            <div className="mt-2 flex items-center gap-2">
              <input
                value={internalQ}
                onChange={(e) => {
                  setInternalEnabled(true)
                  setInternalQ(e.currentTarget.value)
                }}
                placeholder="Rechercher un produit ou une catégorie…"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              />
              {internalLoading ? (
                <span className="text-xs text-gray-500">Recherche…</span>
              ) : internalHasQuery ? (
                <span className="text-xs text-gray-500">
                  {internalCats.length + internalProds.length} résultat
                  {internalCats.length + internalProds.length > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-xs text-gray-500">2+ car.</span>
              )}
            </div>

            {internalError ? <p className="mt-2 text-xs text-red-700">{internalError}</p> : null}

            {internalHasQuery && !internalLoading && !internalError ? (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Catégories</p>
                  <ul className="space-y-1">
                    {internalCats.length ? (
                      internalCats.map((c) => {
                        const href = `/categories/${c.slug}`
                        return (
                          <li key={`c:${c.id}`}>
                            <button
                              type="button"
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:bg-gray-50"
                              onClick={() => {
                                setLinkHref(href)
                                applyLink({ href, insertTextIfEmptySelection: c.name })
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-gray-900 truncate">{c.name}</span>
                                <span className="text-xs text-gray-400">→</span>
                              </div>
                              <div className="mt-0.5 text-xs text-gray-500 truncate">
                                {c.parent?.name ? `${c.parent.name} · ` : ""}/{c.slug}
                                {!c.isVisible ? " · cachée" : ""}
                              </div>
                            </button>
                          </li>
                        )
                      })
                    ) : (
                      <li className="px-2 py-2 text-xs text-gray-500">Aucune catégorie.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Produits</p>
                  <ul className="space-y-1">
                    {internalProds.length ? (
                      internalProds.map((p) => {
                        const href = `/produits/${p.slug}`
                        const meta = [p.section, p.width, p.length, p.type].filter(Boolean).join(" • ")
                        const catHint = p.categories[0]?.category?.name
                        return (
                          <li key={`p:${p.id}`}>
                            <button
                              type="button"
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:bg-gray-50"
                              onClick={() => {
                                setLinkHref(href)
                                applyLink({ href, insertTextIfEmptySelection: p.name })
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-gray-900 truncate">{p.name}</span>
                                <span className="text-xs text-gray-400">→</span>
                              </div>
                              <div className="mt-0.5 text-xs text-gray-500 truncate">
                                {meta || catHint ? `${meta || catHint} · ` : ""}/{p.slug}
                                {!p.isVisible ? " · caché" : ""}
                              </div>
                            </button>
                          </li>
                        )
                      })
                    ) : (
                      <li className="px-2 py-2 text-xs text-gray-500">Aucun produit.</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex-1">
              <span className="sr-only">URL du lien</span>
              <input
                value={linkHref}
                onChange={(e) => setLinkHref(e.currentTarget.value)}
                placeholder="https://…, /page, mailto:, tel:"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
              />
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30"
                onClick={() => applyLink({ href: linkHref })}
              >
                Appliquer
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                onClick={() => {
                  setShowLinkPanel(false)
                  setLinkError(null)
                  savedSelectionRef.current = null
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                onClick={removeLink}
                title="Retirer le lien"
              >
                Retirer
              </button>
            </div>
          </div>
          {linkError ? <p className="mt-2 text-xs text-red-700">{linkError}</p> : null}
          <p className="mt-2 text-xs text-gray-500">
            Astuce: sélectionne un mot (ex: “ici”), clique <span className="font-medium">Lien</span>, colle l’URL, puis{" "}
            <span className="font-medium">Appliquer</span>.
          </p>
        </div>
      ) : null}

      <div className="mt-3 relative">
        <EditorContent editor={editor} />
        {placeholder && !editor.getText().trim() ? (
          <p className="pointer-events-none absolute left-3 top-3 text-sm text-gray-400">
            {placeholder}
          </p>
        ) : null}
      </div>

      {helperText ? <p className="mt-2 text-xs text-gray-500">{helperText}</p> : null}
    </div>
  )
}

