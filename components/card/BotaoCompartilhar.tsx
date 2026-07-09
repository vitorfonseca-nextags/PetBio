"use client";

import { useState } from "react";

export function BotaoCompartilhar({ habilitado }: { habilitado: boolean }) {
  const [copiado, setCopiado] = useState(false);

  if (!habilitado) {
    return (
      <button
        type="button"
        disabled
        title="Disponível depois da compra"
        className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-line text-ink-soft/60"
      >
        ↗
      </button>
    );
  }

  async function copiarLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiarLink}
      title="Compartilhar"
      className="flex h-8 items-center justify-center rounded-full bg-brand-50 px-3 text-sm font-bold text-brand-700"
    >
      {copiado ? "Copiado!" : "↗ Compartilhar"}
    </button>
  );
}
