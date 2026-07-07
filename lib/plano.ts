import type { Plano } from "./types/card";

/**
 * Limite de fotos por plano. Decisão da Fase 2 — CLAUDE.md sugeria "ex.: até 3
 * / até 15", adotamos os valores exatos. Documentado em docs/BLOCOS.md.
 */
export const LIMITE_FOTOS: Record<Plano, number> = {
  simples: 3,
  completo: 15,
};

/**
 * Enquanto o plano ainda não foi definido (pré-compra, prévia com marca
 * d'água), a renderização não corta nada — mostra tudo que já foi
 * preenchido. O corte por plano só passa a valer com plan != null (pago).
 */
export function limiteFotos(plano: Plano | null): number {
  return LIMITE_FOTOS[plano ?? "completo"];
}

export function mostraPersonalidadeEHistorico(plano: Plano | null): boolean {
  return plano !== "simples";
}

export function saudeApenasEssencial(plano: Plano | null): boolean {
  return plano === "simples";
}
