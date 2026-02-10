"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/admin/components/RichTextEditor";
import AdminStickySaveBar from "@/admin/components/AdminStickySaveBar";
import { updateConstructionBannerAction } from "@/admin/actions/siteContentSections";

export default function BanniereForm({
  initial,
  version,
}: {
  initial: { isVisible: boolean; text: string; textHtml?: string };
  version: string;
}) {
  const [state, formAction] = useActionState(
    updateConstructionBannerAction,
    null
  );

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
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-white/20 bg-white/70 p-4 sm:p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-gray-900">
          Bannière — “Site en construction”
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-900">
              Visible
            </span>
            <select
              name="bannerVisible"
              defaultValue={initial.isVisible ? "1" : "0"}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="0">Cachée</option>
              <option value="1">Visible</option>
            </select>
          </label>
        </div>

        <div className="mt-4">
          <RichTextEditor
            inputName="bannerTextHtml"
            initialHtml={initial.textHtml ?? initial.text ?? ""}
            placeholder="Site en construction — certaines informations peuvent évoluer."
          />
        </div>
      </section>

      <AdminStickySaveBar hint="Modifie, puis enregistre (la page confirme quand c’est OK)." />
    </form>
  );
}
