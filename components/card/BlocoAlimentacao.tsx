import type { BlocoAlimentacao as TipoBlocoAlimentacao } from "@/lib/types/card";
import { BlocoExpansivel } from "./BlocoExpansivel";

function Linha({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <p className="text-sm text-neutral-700">
      <span className="font-medium text-neutral-900">{label}:</span> {valor}
    </p>
  );
}

export function BlocoAlimentacao({ alimentacao }: { alimentacao: TipoBlocoAlimentacao }) {
  return (
    <BlocoExpansivel titulo="Alimentação">
      <div className="space-y-1">
        <Linha label="Ração / tipo" valor={alimentacao.racao_marca_tipo} />
        <Linha label="Quantidade" valor={alimentacao.quantidade} />
        <Linha label="Horários" valor={alimentacao.horarios} />
        <Linha label="Petiscos" valor={alimentacao.petiscos} />
        <Linha label="Proibidos" valor={alimentacao.proibidos} />
        <Linha label="Onde fica a comida" valor={alimentacao.onde_fica} />
      </div>
    </BlocoExpansivel>
  );
}
