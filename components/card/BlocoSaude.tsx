import type { BlocoSaude as TipoBlocoSaude } from "@/lib/types/card";
import { BlocoExpansivel } from "./BlocoExpansivel";
import { Linha } from "./Linha";

/**
 * Plano Simples mostra "saúde essencial" (vet, telefone, vacinas, condições).
 * Plano Completo soma clínica de emergência e a lista de medicações.
 * Decisão documentada em docs/BLOCOS.md.
 */
export function BlocoSaude({
  saude,
  essencial,
}: {
  saude: TipoBlocoSaude;
  essencial: boolean;
}) {
  return (
    <BlocoExpansivel titulo="Saúde" icone="🩺">
      <div>
        <Linha label="Veterinário" valor={saude.vet_nome} />
        <Linha label="Telefone do vet" valor={saude.vet_telefone} />
        <Linha label="Vacinas" valor={saude.vacinas} />
        <Linha label="Condições de saúde" valor={saude.condicoes} />
        {!essencial && <Linha label="Clínica de emergência" valor={saude.clinica_emergencia} />}
      </div>
      {!essencial && saude.medicacoes && saude.medicacoes.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Medicações</p>
          <ul className="space-y-1 text-[13px] text-ink">
            {saude.medicacoes.map((m, i) => (
              <li key={m.nome + i}>
                <span className="font-bold">{m.nome}</span>
                {m.dosagem ? ` — ${m.dosagem}` : ""}
                {m.frequencia ? ` (${m.frequencia})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </BlocoExpansivel>
  );
}
