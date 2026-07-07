"use client";

import { useId, useState } from "react";

export function BlocoExpansivel({
  titulo,
  defaultAberto = false,
  children,
}: {
  titulo: string;
  defaultAberto?: boolean;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(defaultAberto);
  const contentId = useId();

  return (
    <section className="border-b border-neutral-200">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-2 py-4 text-left"
      >
        <span className="text-lg font-semibold">{titulo}</span>
        <span aria-hidden className={`transition-transform ${aberto ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {aberto && (
        <div id={contentId} className="pb-4">
          {children}
        </div>
      )}
    </section>
  );
}
