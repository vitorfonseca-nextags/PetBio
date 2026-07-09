import type { BlocoHistorico as TipoBlocoHistorico } from "@/lib/types/card";
import { BlocoExpansivel } from "./BlocoExpansivel";

function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function BlocoHistorico({ eventos }: { eventos: TipoBlocoHistorico }) {
  if (eventos.length === 0) return null;

  const ordenados = [...eventos].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  );

  return (
    <BlocoExpansivel titulo="Histórico" icone="🕰️">
      <ol className="space-y-4 border-l-2 border-line pl-4">
        {ordenados.map((evento, i) => (
          <li key={evento.titulo + evento.data + i} className="relative">
            <span aria-hidden className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-600" />
            <p className="text-[11px] font-bold text-ink-soft">{formatarData(evento.data)}</p>
            <p className="font-bold text-ink">{evento.titulo}</p>
            {evento.descricao && <p className="text-[13px] text-ink-soft">{evento.descricao}</p>}
          </li>
        ))}
      </ol>
    </BlocoExpansivel>
  );
}
