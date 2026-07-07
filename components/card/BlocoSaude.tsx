import type { BlocoSaude as TipoBlocoSaude } from "@/lib/types/card";
import { BlocoExpansivel } from "./BlocoExpansivel";

function Linha({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <p className="text-sm text-neutral-700">
      <span className="font-medium text-neutral-900">{label}:</span> {valor}
    </p>
  );
}

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
    <BlocoExpansivel titulo="Saúde">
      <div className="space-y-1">
        <Linha label="Veterinário" valor={saude.vet_nome} />
        <Linha label="Telefone do vet" valor={saude.vet_telefone} />
        <Linha label="Vacinas" valor={saude.vacinas} />
        <Linha label="Condições de saúde" valor={saude.condicoes} />
        {!essencial && <Linha label="Clínica de emergência" valor={saude.clinica_emergencia} />}
        {!essencial && saude.medicacoes && saude.medicacoes.length > 0 && (
          <div className="pt-1">
            <p className="text-sm font-medium text-neutral-900">Medicações</p>
            <ul className="list-inside list-disc text-sm text-neutral-700">
              {saude.medicacoes.map((m, i) => (
                <li key={m.nome + i}>
                  {m.nome}
                  {m.dosagem ? ` — ${m.dosagem}` : ""}
                  {m.frequencia ? ` (${m.frequencia})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </BlocoExpansivel>
  );
}
