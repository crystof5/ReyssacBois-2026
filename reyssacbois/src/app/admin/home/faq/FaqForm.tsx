"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeFaqEditor from "@/admin/components/HomeFaqEditor";
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar";
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
  const [state, formAction] = useActionState(updateHomeFaqAction, null);

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
              ? "border-green-200 bg-forest-050 text-forest-800"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <HomeFaqEditor initial={initial} />

      <AdminStickySaveBar hint="Modifie, puis enregistre (la page confirme quand c’est OK)." />
    </form>
  );
}
