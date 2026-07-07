import { randomBytes } from "crypto";

// sem 0/1/i/l/o — evita confusão visual quando o código aparece na tela
const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";

/** Gera um candidato a order_code. Unicidade é garantida na inserção (retry em colisão). */
export function gerarOrderCode(tamanho = 8): string {
  const bytes = randomBytes(tamanho);
  let out = "";
  for (let i = 0; i < tamanho; i++) {
    out += ALFABETO[bytes[i] % ALFABETO.length];
  }
  return out;
}
