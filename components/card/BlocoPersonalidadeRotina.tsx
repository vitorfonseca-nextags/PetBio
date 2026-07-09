import type { BlocoPersonalidadeRotina as TipoBloco } from "@/lib/types/card";
import { BlocoExpansivel } from "./BlocoExpansivel";
import { Linha } from "./Linha";

export function BlocoPersonalidadeRotina({ bloco }: { bloco: TipoBloco }) {
  return (
    <BlocoExpansivel titulo="Personalidade e rotina" icone="🎾">
      <div>
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
