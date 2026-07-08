import "server-only";

/**
 * Envio de e-mail transacional via Resend (docs/FASE7.md explica a escolha).
 * `EMAIL_PROVIDER_API_KEY` é a API key do Resend; `EMAIL_FROM` é opcional —
 * sem domínio verificado, usa o remetente de teste do próprio Resend.
 */
export async function enviarEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  if (!apiKey) {
    console.error("EMAIL_PROVIDER_API_KEY não configurado — e-mail não enviado.");
    return false;
  }

  const from = process.env.EMAIL_FROM || "PetBio <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    console.error("Falha ao enviar e-mail via Resend:", res.status, await res.text());
    return false;
  }
  return true;
}
