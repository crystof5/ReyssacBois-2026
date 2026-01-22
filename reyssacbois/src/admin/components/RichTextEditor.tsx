"use client"

import { useEffect, useMemo, useState } from "react"
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
      editor.commands.setContent(initialHtml || "", false)
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

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Lien (https://…, /page, mailto:, tel:)", prev ?? "")
    if (url === null) return
    const v = url.trim()
    if (!v) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: v }).run()
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
          onClick={setLink}
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
            editor.commands.setContent("", false)
            setHtml("")
          }}
        >
          Réinitialiser
        </button>
      </div>

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

