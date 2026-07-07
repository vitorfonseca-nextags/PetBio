"use client";

import { useEffect, useMemo } from "react";

function Preview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />;
}

export function SeletorFotoPrincipal({
  arquivo,
  onChange,
}: {
  arquivo: File | null;
  onChange: (arquivo: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="foto-principal" className="text-sm font-medium text-neutral-900">
        Foto principal
      </label>
      {arquivo && (
        <div className="w-32">
          <Preview file={arquivo} />
        </div>
      )}
      <input
        id="foto-principal"
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block text-sm"
      />
    </div>
  );
}

export function SeletorFotosExtras({
  arquivos,
  limite,
  onChange,
}: {
  arquivos: File[];
  limite: number;
  onChange: (arquivos: File[]) => void;
}) {
  const cheio = arquivos.length >= limite;

  function adicionar(novos: FileList | null) {
    if (!novos) return;
    const restante = limite - arquivos.length;
    onChange([...arquivos, ...Array.from(novos).slice(0, restante)]);
  }

  function remover(i: number) {
    onChange(arquivos.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <label htmlFor="fotos-extras" className="text-sm font-medium text-neutral-900">
        Mais fotos ({arquivos.length}/{limite})
      </label>
      {arquivos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {arquivos.map((file, i) => (
            <div key={i} className="relative">
              <Preview file={file} />
              <button
                type="button"
                onClick={() => remover(i)}
                className="absolute -right-1 -top-1 rounded-full bg-neutral-900 px-1.5 text-xs text-white"
                aria-label="Remover foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {!cheio && (
        <input
          id="fotos-extras"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => adicionar(e.target.files)}
          className="block text-sm"
        />
      )}
      {cheio && (
        <p className="text-xs text-neutral-500">
          Limite de fotos do seu plano atingido.
        </p>
      )}
    </div>
  );
}
