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
    <BlocoExpansivel titulo="Histórico">
      <ol className="space-y-4 border-l-2 border-neutral-200 pl-4">
        {ordenados.map((evento, i) => (
          <li key={evento.titulo + evento.data + i} className="relative">
            <span
              aria-hidden
              className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-neutral-400"
            />
            <p className="text-xs text-neutral-500">{formatarData(evento.data)}</p>
            <p className="font-medium text-neutral-900">{evento.titulo}</p>
            {evento.descricao && (
              <p className="text-sm text-neutral-700">{evento.descricao}</p>
            )}
          </li>
        ))}
      </ol>
    </BlocoExpansivel>
  );
}
