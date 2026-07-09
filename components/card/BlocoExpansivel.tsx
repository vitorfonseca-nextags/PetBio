"use client";

import { useId, useState } from "react";

export function BlocoExpansivel({
  titulo,
  icone,
  defaultAberto = false,
  children,
}: {
  titulo: string;
  icone?: string;
  defaultAberto?: boolean;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(defaultAberto);
  const contentId = useId();

  return (
    <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_-18px_rgba(46,32,24,0.25)]">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-2 px-4 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 text-[15px] font-extrabold text-ink">
          {icone && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm">
              {icone}
            </span>
          )}
          {titulo}
        </span>
        <span aria-hidden className={`text-ink-soft transition-transform ${aberto ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {aberto && (
        <div id={contentId} className="px-4 pb-4">
          {children}
        </div>
      )}
    </section>
  );
}
