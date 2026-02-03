"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeFaqEditor from "@/admin/components/HomeFaqEditor";
import { updateHomeFaqAction } from "@/admin/actions/siteContentSections";

export default function FaqForm({
  initial,
  version,
}: {
  initial: {
    isVisible: boolean;
    title: string;
    introHtml?: string;
    items: Array<{
      id: string;
      isVisible: boolean;
      question: string;
      answerHtml?: string;
    }>;
  };
  version: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateHomeFaqAction,
    null
  );

  const router = useRouter();
  useEffect(() => {
    if (state?.ok) {
      // Rafraîchit les données serveur (et donc l’UI) après un enregistrement.
      router.refresh();
    }
  }, [router, state?.ok]);

  return (
    <form key={version} action={formAction} className="mt-6 space-y-6">
      {state?.message ? (
        <div
          className={`rounded-xl border p-3 text-sm ${
            state.ok
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <HomeFaqEditor initial={initial} />

      <div className="sticky bottom-4 z-10">
        <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-3 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-gray-600">
            Retour au{" "}
            <Link href="/admin/home" className="underline">
              menu Home
            </Link>
            .
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 disabled:opacity-60"
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}
