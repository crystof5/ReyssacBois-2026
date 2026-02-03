"use client";

import { useEffect, useMemo, useState } from "react";
import RichTextEditor from "@/admin/components/RichTextEditor";

export type HomeFaqItemInput = {
  id: string;
  isVisible: boolean;
  question: string;
  answerHtml?: string;
};

export type HomeFaqSettingsInput = {
  isVisible: boolean;
  title: string;
  introHtml?: string;
  items: HomeFaqItemInput[];
};

function newId() {
  try {
    // eslint-disable-next-line no-undef
    return crypto.randomUUID();
  } catch {
    return `faq-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export default function HomeFaqEditor({
  initial,
}: {
  initial: HomeFaqSettingsInput;
}) {
  const [faqVisible, setFaqVisible] = useState<boolean>(
    Boolean(initial.isVisible)
  );
  const [title, setTitle] = useState<string>(initial.title ?? "");
  const [items, setItems] = useState<HomeFaqItemInput[]>(
    Array.isArray(initial.items) && initial.items.length
      ? initial.items
      : [{ id: "faq-1", isVisible: true, question: "", answerHtml: "" }]
  );

  // Quand la page est rafraîchie (router.refresh), les props `initial` peuvent changer.
  // On resynchronise l’état local pour refléter la DB (sinon l’UI peut sembler “revenir en arrière”).
  const initialSyncKey = useMemo(() => {
    return JSON.stringify({
      isVisible: Boolean(initial.isVisible),
      title: initial.title ?? "",
      items: (initial.items ?? []).map((it) => ({
        id: it.id,
        isVisible: Boolean(it.isVisible),
        question: it.question ?? "",
        answerHtml: it.answerHtml ?? "",
      })),
    });
  }, [initial.isVisible, initial.items, initial.title]);

  useEffect(() => {
    setFaqVisible(Boolean(initial.isVisible));
    setTitle(initial.title ?? "");
    setItems(
      Array.isArray(initial.items) && initial.items.length
        ? initial.items
        : [{ id: "faq-1", isVisible: true, question: "", answerHtml: "" }]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSyncKey]);

  const idsJson = useMemo(
    () => JSON.stringify(items.map((i) => i.id)),
    [items]
  );

  return (
    <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-gray-900">Home — FAQ</h3>
      <p className="mt-1 text-xs text-gray-500">
        Cette section s’affiche sur la page d’accueil juste avant le contact.
        Les réponses sont en RichText (liens, gras, listes…).
      </p>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-900">
            Afficher la section FAQ
          </span>
          <select
            name="faqVisible"
            value={faqVisible ? "1" : "0"}
            onChange={(e) => setFaqVisible(e.currentTarget.value === "1")}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
          >
            <option value="0">Cachée</option>
            <option value="1">Visible</option>
          </select>
        </label>

        <label className="block lg:col-span-2">
          <span className="mb-1 block text-sm font-medium text-gray-900">
            Titre
          </span>
          <input
            name="faqTitle"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            placeholder="Questions fréquentes (livraison, agglomération d’Agen, conseils)"
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-900">
            Texte d’introduction
          </span>
          <p className="mt-1 text-xs text-gray-500">
            Affiché sous le titre. Mise en forme possible.
          </p>
        </label>
        <div className="mt-3">
          <RichTextEditor
            inputName="faqIntroHtml"
            initialHtml={initial.introHtml ?? ""}
            placeholder="Texte…"
          />
        </div>
      </div>

      {/* Ordre + liste d’IDs pour le serveur */}
      <input type="hidden" name="faqIds" value={idsJson} />

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">
          Questions ({items.length})
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          onClick={() => {
            const id = newId();
            setItems((prev) => [
              ...prev,
              { id, isVisible: true, question: "", answerHtml: "" },
            ]);
          }}
        >
          + Ajouter une question
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {items.map((it, idx) => (
          <div
            key={it.id}
            className="rounded-3xl border border-gray-200/70 bg-white/55 backdrop-blur p-4 sm:p-5 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-green-800/90">
                  Question {idx + 1}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  ID: <span className="font-mono">{it.id}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-900">
                  <input
                    type="checkbox"
                    name={`faqItemVisible_${it.id}`}
                    checked={Boolean(it.isVisible)}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked;
                      setItems((prev) =>
                        prev.map((x) =>
                          x.id === it.id ? { ...x, isVisible: checked } : x
                        )
                      );
                    }}
                  />
                  Visible
                </label>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  onClick={() =>
                    setItems((prev) => prev.filter((x) => x.id !== it.id))
                  }
                  title="Supprimer cette question"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-900">
                  Question
                </span>
                <input
                  name={`faqQuestion_${it.id}`}
                  value={it.question}
                  onChange={(e) => {
                    const v = e.currentTarget.value;
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === it.id ? { ...x, question: v } : x
                      )
                    );
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                  placeholder="Ex: Livrez-vous du bois dans l’agglomération d’Agen ?"
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-900">
                  Réponse (RichText)
                </span>
              </label>
              <div className="mt-2">
                <RichTextEditor
                  inputName={`faqAnswerHtml_${it.id}`}
                  initialHtml={it.answerHtml ?? ""}
                  placeholder="Réponse…"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
