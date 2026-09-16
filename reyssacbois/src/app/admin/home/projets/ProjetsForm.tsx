"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectsCarouselEditor from "@/admin/components/ProjectsCarouselEditor";
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar";
import { updateHomeProjectsAction } from "@/admin/actions/siteContentSections";

export default function ProjetsForm({
  initial,
  version,
}: {
  initial: {
    speed: "slow" | "normal" | "fast";
    slides: Array<{ src: string; alt: string }>;
  };
  version: string;
}) {
  const [state, formAction] = useActionState(updateHomeProjectsAction, null);

  const router = useRouter();
  useEffect(() => {
    if (state?.ok) router.refresh();
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

      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
        <h3 className="text-sm font-semibold text-ink">
          Home — Nos Projets (carrousel)
        </h3>
        <div className="mt-4">
          <ProjectsCarouselEditor
            initialSpeed={initial.speed}
            initialSlides={initial.slides}
          />
        </div>
      </section>

      <AdminStickySaveBar hint="Modifie, puis enregistre (la page confirme quand c’est OK)." />
    </form>
  );
}
