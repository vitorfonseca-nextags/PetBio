"use client";

import { useState } from "react";
import type { Foto } from "@/lib/types/card";

const LIMITE_ARRASTO = 70;

/**
 * Junta foto_principal + fotos[] numa única pilha arrastável (estilo
 * Tinder), em formato retrato (4:5) — a maioria das fotos vem do celular,
 * então esse enquadramento aproveita a foto quase inteira em vez de cortar
 * as pontas como um formato quadrado/paisagem faria. Decisão da Fase 8.3.
 */
export function PilhaFotos({ fotos, limite, nomePet }: { fotos: Foto[]; limite: number; nomePet: string }) {
  const visiveis = fotos.slice(0, limite);
  const [ordem, setOrdem] = useState(() => visiveis.map((_, i) => i));
  const [avancos, setAvancos] = useState(0);
  const [arrasto, setArrasto] = useState<{ inicioX: number; deltaX: number } | null>(null);
  const [saindo, setSaindo] = useState<{ sequencia: 1 | -1; voo: 1 | -1 } | null>(null);

  if (visiveis.length === 0) return null;

  // `sequencia` decide qual foto assume a frente da pilha (1 = próxima,
  // -1 = anterior). `voo` é só a direção visual em que o card atual sai da
  // tela — ao arrastar, sai continuando o próprio arrasto; nos botões, sai
  // no sentido "de leitura" (próxima sai pela esquerda).
  function avancar(sequencia: 1 | -1, voo: 1 | -1 = sequencia === 1 ? -1 : 1) {
    if (saindo) return;
    setSaindo({ sequencia, voo });
    setTimeout(() => {
      setOrdem((atual) =>
        sequencia === 1 ? [...atual.slice(1), atual[0]] : [atual[atual.length - 1], ...atual.slice(0, -1)],
      );
      setAvancos((n) => n + sequencia);
      setSaindo(null);
      setArrasto(null);
    }, 320);
  }

  function aoIniciar(e: React.PointerEvent) {
    if (saindo) return;
    setArrasto({ inicioX: e.clientX, deltaX: 0 });
  }
  function aoMover(e: React.PointerEvent) {
    if (!arrasto) return;
    setArrasto({ ...arrasto, deltaX: e.clientX - arrasto.inicioX });
  }
  function aoSoltar() {
    if (!arrasto) return;
    if (Math.abs(arrasto.deltaX) > LIMITE_ARRASTO) {
      const voo = arrasto.deltaX < 0 ? -1 : 1;
      const sequencia = arrasto.deltaX < 0 ? 1 : -1;
      avancar(sequencia, voo);
    } else {
      setArrasto(null);
    }
  }

  const indiceAtual = ((avancos % visiveis.length) + visiveis.length) % visiveis.length;

  return (
    <div>
      <div className="relative aspect-[4/5] w-full">
        {ordem.map((indiceFoto, posicao) => {
          const foto = visiveis[indiceFoto];
          const frente = posicao === 0;
          let transform = "";
          let opacity = 1;
          let transition = "transform 0.32s cubic-bezier(.2,.8,.2,1), opacity 0.32s";

          if (frente) {
            // estado de repouso é transform="" / opacity=1 (os defaults acima)
            if (arrasto) {
              transform = `translateX(${arrasto.deltaX}px) rotate(${arrasto.deltaX / 18}deg)`;
              transition = "none";
            } else if (saindo) {
              transform = `translateX(${saindo.voo * 420}px) rotate(${saindo.voo * 26}deg)`;
              opacity = 0;
            }
          } else if (posicao === 1) {
            transform = "translateY(8px) scale(0.96) rotate(-3deg)";
            opacity = 0.9;
          } else if (posicao === 2) {
            transform = "translateY(14px) scale(0.92) rotate(4deg)";
            opacity = 0.7;
          } else {
            opacity = 0;
          }

          return (
            <div
              key={indiceFoto}
              className="absolute inset-0 overflow-hidden rounded-xl bg-neutral-100 shadow-sm"
              style={{ transform, opacity, transition, zIndex: visiveis.length - posicao, cursor: frente ? "grab" : "default" }}
              onPointerDown={frente ? aoIniciar : undefined}
              onPointerMove={frente ? aoMover : undefined}
              onPointerUp={frente ? aoSoltar : undefined}
              onPointerCancel={frente ? aoSoltar : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt={foto.alt ?? nomePet}
                className="pointer-events-none h-full w-full select-none object-cover"
                draggable={false}
              />
              {visiveis.length > 1 && frente && (
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-neutral-700">
                  {indiceAtual + 1}/{visiveis.length}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {visiveis.length > 1 && (
        <div className="mt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => avancar(-1)}
            aria-label="Foto anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-sm text-neutral-600"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => avancar(1)}
            aria-label="Próxima foto"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-sm text-neutral-600"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
