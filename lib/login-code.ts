import { randomInt } from "crypto";

/** Código numérico de 6 dígitos pro login sem senha (fácil de ler/digitar). */
export function gerarCodigoLogin(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
