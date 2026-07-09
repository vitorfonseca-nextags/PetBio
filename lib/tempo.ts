const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const formatador = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/** "há 3 dias" / "hoje" a partir de um timestamp ISO — usado no rodapé do card. */
export function formatarTempoRelativo(dataIso: string): string {
  const segundos = (Date.now() - new Date(dataIso).getTime()) / 1000;
  if (segundos < 60) return "agora mesmo";

  for (const [unidade, segundosPorUnidade] of UNIDADES) {
    const valor = Math.floor(segundos / segundosPorUnidade);
    if (valor >= 1) return formatador.format(-valor, unidade);
  }
  return "agora mesmo";
}
