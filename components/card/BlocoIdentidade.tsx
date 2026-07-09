import type { BlocoIdentidade as TipoBlocoIdentidade } from "@/lib/types/card";
import { calcularIdade } from "@/lib/idade";
import { PilhaFotos } from "./PilhaFotos";
import { Linha } from "./Linha";

const PORTE_LABEL: Record<string, string> = {
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

const SEXO_LABEL: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
};

/** Bloco sempre visível e sempre aberto — mesmo tratamento visual dos demais, sem o botão de recolher. */
export function BlocoIdentidade({
  identidade,
  limiteFotos,
}: {
  identidade: TipoBlocoIdentidade;
  limiteFotos: number;
}) {
  // foto_principal + fotos[] numa pilha só (Fase 8.3); mantém a mesma
  // capacidade total de antes (1 principal + limite da galeria).
  const todasFotos = identidade.foto_principal
    ? [identidade.foto_principal, ...(identidade.fotos ?? [])]
    : identidade.fotos ?? [];
  const limiteTotal = identidade.foto_principal ? limiteFotos + 1 : limiteFotos;

  const idade = calcularIdade(identidade.nascimento, identidade.idade_aproximada);
  const chips = [
    idade,
    identidade.sexo ? SEXO_LABEL[identidade.sexo] : undefined,
    identidade.porte ? `Porte ${PORTE_LABEL[identidade.porte]}` : undefined,
  ].filter((c): c is string => !!c);

  return (
    <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_-18px_rgba(46,32,24,0.25)]">
      <div className="px-4 pt-4">
        <PilhaFotos fotos={todasFotos} limite={limiteTotal} nomePet={identidade.nome} />
      </div>
      <div className="px-4 pb-4 pt-3">
        <h1 className="flex items-baseline gap-1.5 text-xl font-extrabold text-ink">
          {identidade.nome} <span className="text-sm">🐾</span>
        </h1>
        {identidade.apelido && <p className="text-[13px] font-semibold text-ink-soft">{identidade.apelido}</p>}

        {chips.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-bold text-ink"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3">
          <Linha label="Espécie" valor={identidade.especie} />
          <Linha label="Raça" valor={identidade.raca} />
          <Linha label="Cores" valor={identidade.cores} />
          <Linha label="Marcas distintivas" valor={identidade.marcas_distintivas} />
        </div>
      </div>
    </section>
  );
}
