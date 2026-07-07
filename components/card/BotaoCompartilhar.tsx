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
        className="cursor-not-allowed rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-400"
      >
        Compartilhar (bloqueado)
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
      className="rounded-full border border-neutral-900 px-4 py-2 text-sm font-medium"
    >
      {copiado ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
