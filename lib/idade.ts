/**
 * "9 anos" / "8 meses" a partir da data de nascimento. Cai pra
 * `idade_aproximada` (texto livre do quiz) quando não há data — usado no
 * chip de estatística do card (Fase 8.3).
 */
export function calcularIdade(nascimento?: string, idadeAproximada?: string): string | undefined {
  if (!nascimento) return idadeAproximada;

  const data = new Date(nascimento);
  if (Number.isNaN(data.getTime())) return idadeAproximada;

  const hoje = new Date();
  let anos = hoje.getFullYear() - data.getFullYear();
  let meses = hoje.getMonth() - data.getMonth();
  if (hoje.getDate() < data.getDate()) meses -= 1;
  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }

  if (anos < 0) return idadeAproximada;
  if (anos === 0) return meses <= 1 ? "Recém-nascido" : `${meses} meses`;
  return anos === 1 ? "1 ano" : `${anos} anos`;
}
