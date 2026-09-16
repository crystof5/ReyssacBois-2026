"use client"

import { deleteArticleAction } from "@/admin/actions/editorial"

/** Suppression d'un guide, avec confirmation. */
export default function DeleteArticleButton({ id }: { id: string }) {
  return (
    <form
      action={deleteArticleAction}
      onSubmit={(e) => {
        if (!window.confirm("Supprimer définitivement ce guide ?")) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rb-btn border border-red-200 bg-red-50 text-red-700 hover:bg-red-100">
        Supprimer le guide
      </button>
    </form>
  )
}
