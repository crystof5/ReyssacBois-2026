"use client";

import { useFormStatus } from "react-dom";

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ?? "h-4 w-4"}
    >
      <path
        d="M12 3a9 9 0 1 0 9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AdminFloatingSaveButton() {
  const { pending } = useFormStatus();

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600/30 disabled:opacity-60"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="h-4 w-4 animate-spin" />
            Enregistrement…
          </span>
        ) : (
          "Enregistrer"
        )}
      </button>
    </div>
  );
}
