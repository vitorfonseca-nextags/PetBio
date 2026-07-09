"use client";

import type { EventoHistorico } from "@/lib/types/card";
import { EXEMPLOS } from "@/lib/quiz/exemplos";
import { Campo } from "./Campo";

export function ListaHistorico({
  eventos,
  onChange,
}: {
  eventos: EventoHistorico[];
  onChange: (eventos: EventoHistorico[]) => void;
}) {
  function atualizar(i: number, campo: keyof EventoHistorico, valor: string) {
    onChange(eventos.map((e, idx) => (idx === i ? { ...e, [campo]: valor } : e)));
  }

  function remover(i: number) {
    onChange(eventos.filter((_, idx) => idx !== i));
  }

  function adicionar() {
    onChange([...eventos, { data: "", titulo: "", descricao: "" }]);
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-line bg-cream p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-soft">Evento {i + 1}</span>
            <button type="button" onClick={() => remover(i)} className="text-xs font-bold text-red-600">
              Remover
            </button>
          </div>
          <Campo
            label="Data"
            tipo="date"
            value={evento.data}
            onChange={(v) => atualizar(i, "data", v)}
          />
          <Campo
            label="Título"
            value={evento.titulo}
            onChange={(v) => atualizar(i, "titulo", v)}
            exemplo={EXEMPLOS.historicoTitulo}
          />
          <Campo
            label="Descrição"
            linhas={2}
            value={evento.descricao ?? ""}
            onChange={(v) => atualizar(i, "descricao", v)}
            exemplo={EXEMPLOS.historicoDescricao}
          />
        </div>
      ))}
      <button type="button" onClick={adicionar} className="text-sm font-bold text-brand-600">
        + adicionar evento
      </button>
    </div>
  );
}
