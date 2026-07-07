/**
 * Monta o link de checkout da Yampi com o order_code como metadata — a Yampi
 * ecoa qualquer `metadata[chave]=valor` da URL de compra de volta no payload
 * do webhook (`resource.metadata.data`), o que a Fase 6 usa pra casar o
 * pagamento com o pedido. Colchetes ficam literais na URL (não
 * URL-encodados) — é o formato exato documentado pela Yampi.
 * https://help.yampi.com.br/pt-BR/articles/12166025-como-usar-metadata-e-utms-na-yampi
 */
export function linkCheckoutYampi(baseUrl: string, orderCode: string): string {
  const separador = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separador}metadata[order_code]=${encodeURIComponent(orderCode)}`;
}
