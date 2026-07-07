"use client";

import type { Medicacao } from "@/lib/types/card";
import { EXEMPLOS } from "@/lib/quiz/exemplos";
import { Campo } from "./Campo";

export function ListaMedicacoes({
  medicacoes,
  onChange,
}: {
  medicacoes: Medicacao[];
  onChange: (medicacoes: Medicacao[]) => void;
}) {
  function atualizar(i: number, campo: keyof Medicacao, valor: string) {
    onChange(medicacoes.map((m, idx) => (idx === i ? { ...m, [campo]: valor } : m)));
  }

  function remover(i: number) {
    onChange(medicacoes.filter((_, idx) => idx !== i));
  }

  function adicionar() {
    onChange([...medicacoes, { nome: "", dosagem: "", frequencia: "" }]);
  }

  return (
    <div className="space-y-4">
      {medicacoes.map((m, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Medicação {i + 1}</span>
            <button
              type="button"
              onClick={() => remover(i)}
              className="text-xs text-red-600 underline"
            >
              Remover
            </button>
          </div>
          <Campo
            label="Nome"
            value={m.nome}
            onChange={(v) => atualizar(i, "nome", v)}
            exemplo={EXEMPLOS.medicacaoNome}
          />
          <Campo
            label="Dosagem"
            value={m.dosagem ?? ""}
            onChange={(v) => atualizar(i, "dosagem", v)}
            exemplo={EXEMPLOS.medicacaoDosagem}
          />
          <Campo
            label="Frequência"
            value={m.frequencia ?? ""}
            onChange={(v) => atualizar(i, "frequencia", v)}
            exemplo={EXEMPLOS.medicacaoFrequencia}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={adicionar}
        className="text-sm font-medium text-emerald-700 underline"
      >
        + adicionar medicação
      </button>
    </div>
  );
}
