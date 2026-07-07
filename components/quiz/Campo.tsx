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
        <label htmlFor={id} className="text-sm font-medium text-neutral-900">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
        {exemplo && (
          <button
            type="button"
            onClick={() => onChange(exemplo)}
            className="shrink-0 text-xs font-medium text-emerald-700 underline underline-offset-2"
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
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      ) : (
        <input
          id={id}
          type={tipo}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
