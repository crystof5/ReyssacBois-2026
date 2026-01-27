"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"

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
          "min-h-28 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-green-600/20",
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

  const applyLink = () => {
    const v = normalizeHref(linkHref)
    setLinkError(null)

    if (!isAllowedHref(v)) {
      setLinkError("Lien invalide. Utilise https://…, /page, mailto:, tel:.")
      return
    }

    // Restaure la sélection (pour permettre “clique ici” -> lien sur “ici”).
    const saved = savedSelectionRef.current
    if (saved) editor.commands.setTextSelection(saved)

    // Si rien n'est sélectionné, on ne peut pas créer un lien “sur un mot”.
    // On garde quand même le panneau ouvert et on affiche une aide.
    const curSel = editor.state.selection
    const hasSelection = curSel.to > curSel.from
    if (!hasSelection && !editor.isActive("link")) {
      setLinkError("Sélectionne d’abord un mot/texte dans l’éditeur, puis clique “Appliquer”.")
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
                onClick={applyLink}
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

