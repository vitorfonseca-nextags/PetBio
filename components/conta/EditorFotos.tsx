"use client";

import { useEffect, useMemo } from "react";

export interface FotoEditavel {
  url?: string;
  file?: File;
}

function Preview({ foto }: { foto: FotoEditavel }) {
  const blobUrl = useMemo(() => (foto.file ? URL.createObjectURL(foto.file) : null), [foto.file]);
  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={foto.url ?? blobUrl ?? ""} alt="" className="aspect-square w-full rounded-xl object-cover" />;
}

export function EditorFotoPrincipal({
  foto,
  onChange,
}: {
  foto: FotoEditavel | null;
  onChange: (foto: FotoEditavel) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="editor-foto-principal" className="text-[13px] font-bold text-ink">
        Foto principal
      </label>
      {foto && (
        <div className="w-24">
          <Preview foto={foto} />
        </div>
      )}
      <input
        id="editor-foto-principal"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange({ file });
        }}
        className="block text-[13px] text-ink-soft"
      />
    </div>
  );
}

export function EditorFotosExtras({
  fotos,
  limite,
  onChange,
}: {
  fotos: FotoEditavel[];
  limite: number;
  onChange: (fotos: FotoEditavel[]) => void;
}) {
  const cheio = fotos.length >= limite;

  function adicionar(novos: FileList | null) {
    if (!novos) return;
    const restante = limite - fotos.length;
    onChange([...fotos, ...Array.from(novos).slice(0, restante).map((file) => ({ file }))]);
  }

  function remover(i: number) {
    onChange(fotos.filter((_, idx) => idx !== i));
  }

  function mover(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= fotos.length) return;
    const copia = [...fotos];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    onChange(copia);
  }

  return (
    <div className="space-y-2">
      <label htmlFor="editor-fotos-extras" className="text-[13px] font-bold text-ink">
        Mais fotos ({fotos.length}/{limite})
      </label>
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((foto, i) => (
            <div key={i} className="space-y-1">
              <div className="relative">
                <Preview foto={foto} />
                <button
                  type="button"
                  onClick={() => remover(i)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs text-white"
                  aria-label="Remover foto"
                >
                  ×
                </button>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  className="text-xs text-ink-soft disabled:opacity-30"
                  aria-label="Mover foto para cima"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === fotos.length - 1}
                  className="text-xs text-ink-soft disabled:opacity-30"
                  aria-label="Mover foto para baixo"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!cheio && (
        <input
          id="editor-fotos-extras"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => adicionar(e.target.files)}
          className="block text-[13px] text-ink-soft"
        />
      )}
      {cheio && <p className="text-xs text-ink-soft">Limite de fotos do seu plano atingido.</p>}
    </div>
  );
}
