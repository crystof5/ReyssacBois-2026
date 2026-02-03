"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function getHrefFromClickTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const a = target.closest("a");
  if (!a) return null;
  return a.getAttribute("href");
}

function shouldIgnoreClick(e: MouseEvent) {
  return (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.altKey ||
    e.ctrlKey ||
    e.shiftKey
  );
}

function normalizePathname(href: string) {
  try {
    const url = href.startsWith("http")
      ? new URL(href)
      : new URL(href, window.location.href);
    return url.pathname;
  } catch {
    return null;
  }
}

export default function AdminNavLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const showTimerRef = useRef<number | null>(null);

  // Stop loader when navigation completes (pathname changes)
  useEffect(() => {
    setIsLoading(false);
    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, [pathname]);

  // Start loader on admin link click (covers cases where loading.tsx isn't shown)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (shouldIgnoreClick(e)) return;

      const href = getHrefFromClickTarget(e.target);
      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const nextPath = normalizePathname(href);
      if (!nextPath) return;
      if (!nextPath.startsWith("/admin")) return;
      if (nextPath === pathname) return;

      // Avoid flashing for super-fast navigations: show after 150ms.
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      showTimerRef.current = window.setTimeout(() => {
        setIsLoading(true);
      }, 150);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px]" />
      <div className="relative rounded-2xl border border-white/30 bg-white/80 px-5 py-4 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.7)] ring-1 ring-black/10">
        <div className="flex items-center gap-3">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-700"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">Chargement…</p>
            <p className="text-xs text-gray-600">La section admin arrive.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
