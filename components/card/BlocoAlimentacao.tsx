import type { BlocoAlimentacao as TipoBlocoAlimentacao } from "@/lib/types/card";
import { BlocoExpansivel } from "./BlocoExpansivel";
import { Linha } from "./Linha";

export function BlocoAlimentacao({ alimentacao }: { alimentacao: TipoBlocoAlimentacao }) {
  return (
    <BlocoExpansivel titulo="Alimentação" icone="🍖">
      <div>
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
