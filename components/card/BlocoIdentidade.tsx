import type { BlocoIdentidade as TipoBlocoIdentidade } from "@/lib/types/card";
import { Galeria } from "./Galeria";

const PORTE_LABEL: Record<string, string> = {
  pequeno: "Pequeno porte",
  medio: "Médio porte",
  grande: "Grande porte",
};

function Linha({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <p className="text-sm text-neutral-700">
      <span className="font-medium text-neutral-900">{label}:</span> {valor}
    </p>
  );
}

/** Bloco sempre visível e sempre aberto — não usa BlocoExpansivel. */
export function BlocoIdentidade({
  identidade,
  limiteFotos,
}: {
  identidade: TipoBlocoIdentidade;
  limiteFotos: number;
}) {
  const fotos = identidade.fotos ?? [];

  return (
    <section className="space-y-3 py-4">
      {identidade.foto_principal && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={identidade.foto_principal.url}
          alt={identidade.foto_principal.alt ?? identidade.nome}
          className="aspect-square w-full rounded-xl object-cover"
        />
      )}
      <div>
        <h1 className="text-2xl font-bold">{identidade.nome}</h1>
        {identidade.apelido && (
          <p className="text-neutral-500">&ldquo;{identidade.apelido}&rdquo;</p>
        )}
      </div>
      <div className="space-y-1">
        <Linha label="Espécie" valor={identidade.especie} />
        <Linha label="Raça" valor={identidade.raca} />
        <Linha
          label="Sexo"
          valor={
            identidade.sexo === "macho"
              ? "Macho"
              : identidade.sexo === "femea"
                ? "Fêmea"
                : undefined
          }
        />
        <Linha label="Nascimento" valor={identidade.nascimento} />
        <Linha label="Idade" valor={identidade.idade_aproximada} />
        <Linha label="Porte" valor={identidade.porte ? PORTE_LABEL[identidade.porte] : undefined} />
        <Linha label="Cores" valor={identidade.cores} />
        <Linha label="Marcas distintivas" valor={identidade.marcas_distintivas} />
      </div>
      <Galeria fotos={fotos} limite={limiteFotos} />
    </section>
  );
}
