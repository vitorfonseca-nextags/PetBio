import type { BlocoPersonalidadeRotina as TipoBloco } from "@/lib/types/card";
import { BlocoExpansivel } from "./BlocoExpansivel";

function Linha({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <p className="text-sm text-neutral-700">
      <span className="font-medium text-neutral-900">{label}:</span> {valor}
    </p>
  );
}

export function BlocoPersonalidadeRotina({ bloco }: { bloco: TipoBloco }) {
  return (
    <BlocoExpansivel titulo="Personalidade e rotina">
      <div className="space-y-1">
        <Linha label="Temperamento" valor={bloco.temperamento} />
        <Linha label="Medos" valor={bloco.medos} />
        <Linha label="Manias" valor={bloco.manias} />
        <Linha label="Comandos que conhece" valor={bloco.comandos} />
        <Linha label="Rotina de passeio" valor={bloco.rotina_passeio} />
        <Linha label="Rotina de sono" valor={bloco.rotina_sono} />
        <Linha label="Brinquedos favoritos" valor={bloco.brinquedos} />
        <Linha label="Lugares favoritos" valor={bloco.lugares_favoritos} />
      </div>
    </BlocoExpansivel>
  );
}
