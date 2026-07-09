"use client";

import { useId } from "react";

export function Campo({
  label,
  value,
  onChange,
  exemplo,
  linhas,
  tipo = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  exemplo?: string;
  linhas?: number;
  tipo?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const id = useId();

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-ink">
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
          placeholder={placeholder}
          rows={linhas}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:bg-white focus:outline-none"
        />
      ) : (
        <input
          id={id}
          type={tipo}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:bg-white focus:outline-none"
        />
      )}
    </div>
  );
}
