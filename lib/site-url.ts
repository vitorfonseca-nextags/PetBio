/**
 * URL pública de um card, usada pro QR Code e pro link enviado no WhatsApp.
 * Usa NEXT_PUBLIC_APP_URL se configurada (produção); senão cai pro domínio
 * final do produto (APP_BASE_DOMAIN); senão localhost, pra dev sem nada
 * configurado ainda não quebrar.
 */
export function urlPublica(slug: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.APP_BASE_DOMAIN ? `https://${process.env.APP_BASE_DOMAIN}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/${slug}`;
}
