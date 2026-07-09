"use client";

import { useId } from "react";

/**
 * Campo de formulário com a identidade visual (Fase 8.3) — versão própria da
 * área do cliente, separada de components/quiz/Campo.tsx de propósito: o
 * quiz ainda não passou pelo refino visual (fica pra Fase 8.4), então não
 * misturamos a paleta nova nos campos dele.
 */
export function CampoEditor({
  label,
  value,
  onChange,
  exemplo,
  linhas,
  tipo = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  exemplo?: string;
  linhas?: number;
  tipo?: string;
  required?: boolean;
}) {
  const id = useId();

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-bold text-ink">
          {label}
          {required && <span className="text-brand-600"> *</span>}
        </label>
        {exemplo && (
          <button
            type="button"
            onClick={() => onChange(exemplo)}
            className="shrink-0 text-xs font-bold text-brand-600"
          >
            Gerar exemplo
          </button>
        )}
      </div>
      {linhas ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={linhas}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-[13px] text-ink focus:border-brand-600 focus:bg-white focus:outline-none"
        />
      ) : (
        <input
          id={id}
          type={tipo}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-[13px] text-ink focus:border-brand-600 focus:bg-white focus:outline-none"
        />
      )}
    </div>
  );
}

export function SelectEditor({
  label,
  value,
  onChange,
  opcoes,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  opcoes: { valor: string; texto: string }[];
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[13px] font-bold text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-[13px] text-ink focus:border-brand-600 focus:bg-white focus:outline-none"
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </div>
  );
}
