"use client";

import { useEffect, useMemo } from "react";

function Preview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="aspect-square w-full rounded-xl object-cover" />;
}

const CLASSE_INPUT_ARQUIVO =
  "block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-brand-700";

export function SeletorFotoPrincipal({
  arquivo,
  onChange,
}: {
  arquivo: File | null;
  onChange: (arquivo: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="foto-principal" className="text-sm font-bold text-ink">
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
        className={CLASSE_INPUT_ARQUIVO}
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
      <label htmlFor="fotos-extras" className="text-sm font-bold text-ink">
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
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs text-white"
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
          className={CLASSE_INPUT_ARQUIVO}
        />
      )}
      {cheio && <p className="text-xs text-ink-soft">Limite de fotos atingido.</p>}
    </div>
  );
}
