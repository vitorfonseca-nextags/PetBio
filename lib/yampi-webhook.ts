import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { Plano } from "./types/card";

/**
 * Valida o header X-Yampi-Hmac-SHA256: HMAC-SHA256 do corpo bruto (string,
 * antes de qualquer JSON.parse) usando o segredo do webhook, em base64.
 * https://docs.yampi.com.br/api-reference/introduction-webhook
 */
export function assinaturaYampiValida(
  corpoBruto: string,
  assinaturaRecebida: string | null,
  segredo: string,
): boolean {
  if (!assinaturaRecebida) return false;
  const esperada = createHmac("sha256", segredo).update(corpoBruto).digest("base64");
  const bufEsperado = Buffer.from(esperada);
  const bufRecebido = Buffer.from(assinaturaRecebida);
  if (bufEsperado.length !== bufRecebido.length) return false;
  return timingSafeEqual(bufEsperado, bufRecebido);
}

// A Yampi ora devolve listas como array direto, ora como { data: [...] } —
// depende do recurso. Normaliza os dois formatos.
function paraArray<T>(valor: unknown): T[] {
  if (Array.isArray(valor)) return valor as T[];
  if (valor && typeof valor === "object" && Array.isArray((valor as { data?: unknown }).data)) {
    return (valor as { data: T[] }).data;
  }
  return [];
}

/** Lê um valor de metadata (ex.: order_code) do `resource` do webhook. */
export function extrairMetadata(resource: unknown, chave: string): string | null {
  const metadata = paraArray<{ key: string; value: string }>(
    (resource as { metadata?: unknown } | undefined)?.metadata,
  );
  return metadata.find((m) => m.key === chave)?.value ?? null;
}

// SKUs criados em scripts/yampi-setup.mjs.
const SKU_PARA_PLANO: Record<string, Plano> = {
  "PETBIO-SIMPLES": "simples",
  "PETBIO-COMPLETO": "completo",
};

/** Identifica o plano comprado pelo SKU dos itens do pedido. */
export function extrairPlano(resource: unknown): Plano | null {
  const itens = paraArray<{ item_sku?: string; sku?: string }>(
    (resource as { items?: unknown } | undefined)?.items,
  );
  for (const item of itens) {
    const sku = (item.item_sku || item.sku || "").toUpperCase();
    if (SKU_PARA_PLANO[sku]) return SKU_PARA_PLANO[sku];
  }
  return null;
}

/**
 * Lê o e-mail do cliente em `resource.customer.data.email` (formato
 * confirmado chamando a API real de pedidos da Yampi — recurso singular vem
 * como `{ data: {...} }`, diferente de `metadata`/`items` que vêm como
 * array). Ausência não é erro: o e-mail só passa a existir depois que o
 * comprador preenche o checkout; se o formato mudar, login por código
 * simplesmente não terá e-mail pra casar (ver docs/FASE7.md).
 */
export function extrairEmailCliente(resource: unknown): string | null {
  const email = (resource as { customer?: { data?: { email?: string } } } | undefined)?.customer?.data
    ?.email;
  return typeof email === "string" && email.includes("@") ? email : null;
}

/**
 * Lê o primeiro nome do cliente em `resource.customer.data.first_name`
 * (formato confirmado chamando a API real de pedidos da Yampi — mesmo
 * objeto `customer.data` usado em `extrairEmailCliente`). A Yampi grava em
 * caixa alta ("GABRIEL"); normaliza pra exibição na mensagem de WhatsApp.
 */
export function extrairNomeCliente(resource: unknown): string | null {
  const nome = (resource as { customer?: { data?: { first_name?: string } } } | undefined)?.customer
    ?.data?.first_name;
  if (typeof nome !== "string" || !nome.trim()) return null;
  const limpo = nome.trim().toLowerCase();
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}
