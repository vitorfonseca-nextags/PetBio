import "server-only";
import { urlPublica } from "./site-url";

/**
 * Integração com a NexTags AI (WhatsApp). A API é orientada a contato +
 * "Flow": mensagens de texto/arquivo livres (`send/text`, `send/file`) só
 * chegam a quem já mandou mensagem pro número nas últimas 24h — pra
 * disparar pra quem nunca falou com a gente (nosso caso: prévia e entrega),
 * é obrigatório usar um Flow montado no painel visual da NexTags a partir de
 * um modelo de mensagem WhatsApp aprovado (categoria Utilidade). O Flow lê
 * os dados dinâmicos dos "custom fields" do contato, então o fluxo de envio
 * é: cria/acha o contato pelo telefone -> seta os campos -> dispara o Flow.
 *
 * Os Flows de entrega foram clonados dos flows do Revivo (mesma conta
 * NexTags da Cayen), mas os campos usados aqui são próprios do PetBio
 * (nomes claros, sem reaproveitar os genéricos `name_a`/`access_url`/etc. do
 * Revivo) — o operador precisa referenciar estes nomes nos Flows do painel.
 */
const CAMPO_LINK_CARD = 299888; // link_card_pet — link do card
const CAMPO_QR_CODE = 326711; // qr_code_pet — imagem do QR Code
const CAMPO_NOME_TUTOR = 546589; // nome_tutor
const CAMPO_NOME_PET = 292033; // nome_pet
const CAMPO_NUMERO_PEDIDO = 390409; // numero_pedido

const BASE_URL = "https://app.nextagsai.com.br/api";

function chaveApi(): string {
  const chave = process.env.NEXTAGS_API_KEY;
  if (!chave) throw new Error("NEXTAGS_API_KEY não configurado");
  return chave;
}

async function chamarApi(caminho: string, init: RequestInit): Promise<unknown> {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    ...init,
    headers: { ...init.headers, "X-ACCESS-TOKEN": chaveApi() },
  });
  if (!resposta.ok) {
    throw new Error(`NexTags ${caminho} respondeu ${resposta.status}: ${await resposta.text()}`);
  }
  return resposta.json();
}

/** Normaliza pro formato E.164 (+55...) que a API espera. */
function normalizarTelefone(whatsapp: string): string {
  const digitos = whatsapp.replace(/\D/g, "");
  return `+${digitos.startsWith("55") ? digitos : `55${digitos}`}`;
}

async function criarOuBuscarContato(whatsapp: string, nome: string): Promise<string> {
  const resposta = (await chamarApi("/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: normalizarTelefone(whatsapp), first_name: nome }),
  })) as { data: { id: string } };
  return resposta.data.id;
}

async function definirCampo(contactId: string, campoId: number, valor: string): Promise<void> {
  await chamarApi(`/contacts/${contactId}/custom_fields/${campoId}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ value: valor }),
  });
}

async function dispararFlow(contactId: string, flowId: string): Promise<void> {
  await chamarApi(`/contacts/${contactId}/send/${flowId}`, { method: "POST" });
}

async function comRetry(fn: () => Promise<void>, tentativas = 2): Promise<void> {
  for (let i = 0; i <= tentativas; i++) {
    try {
      await fn();
      return;
    } catch (erro) {
      if (i === tentativas) throw erro;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * Dispara a prévia por WhatsApp ao final do quiz (Fase 5.2). Nunca lança —
 * falha de envio não pode travar o fluxo de quem está criando o card
 * (Fase 5.3); só loga o erro.
 */
export async function dispararPreviaWhatsapp(dados: {
  whatsapp: string;
  orderCode: string;
  nomePet: string;
}): Promise<void> {
  const flowId = process.env.NEXTAGS_FLOW_PREVIA;
  if (!flowId) {
    console.warn("NEXTAGS_FLOW_PREVIA não configurado — prévia por WhatsApp não enviada.");
    return;
  }
  try {
    await comRetry(async () => {
      const contactId = await criarOuBuscarContato(dados.whatsapp, dados.nomePet);
      // dono ainda não é conhecido nesse ponto do funil (só coletado no
      // checkout da Yampi) — nome_tutor fica de fora aqui, só nome_pet.
      await definirCampo(contactId, CAMPO_NOME_PET, dados.nomePet);
      await definirCampo(contactId, CAMPO_NUMERO_PEDIDO, dados.orderCode);
      await definirCampo(contactId, CAMPO_LINK_CARD, urlPublica(dados.orderCode));
      await dispararFlow(contactId, flowId);
    });
  } catch (erro) {
    console.error("Falha ao enviar prévia por WhatsApp:", erro);
  }
}

/**
 * Dispara a entrega por WhatsApp após o pagamento confirmado (Fase 7.1):
 * primeiro o Flow de "pagamento aprovado", depois o de link+QR — mesma
 * regra de nunca travar o fluxo: aqui é o webhook da Yampi, uma falha de
 * WhatsApp não pode derrubar a resposta do pagamento processado.
 */
export async function dispararEntregaWhatsapp(dados: {
  whatsapp: string;
  orderCode: string;
  slug: string;
  qrUrl: string;
  nomePet: string;
  nomeDono?: string;
}): Promise<void> {
  const flowAprovado = process.env.NEXTAGS_FLOW_ENTREGA_APROVADO;
  const flowQr = process.env.NEXTAGS_FLOW_ENTREGA_QR;
  if (!flowAprovado && !flowQr) {
    console.warn("NEXTAGS_FLOW_ENTREGA_* não configurado — entrega por WhatsApp não enviada.");
    return;
  }
  try {
    await comRetry(async () => {
      const contactId = await criarOuBuscarContato(dados.whatsapp, dados.nomeDono ?? dados.nomePet);
      await definirCampo(contactId, CAMPO_NOME_TUTOR, dados.nomeDono ?? "");
      await definirCampo(contactId, CAMPO_NOME_PET, dados.nomePet);
      await definirCampo(contactId, CAMPO_NUMERO_PEDIDO, dados.orderCode);
      await definirCampo(contactId, CAMPO_LINK_CARD, urlPublica(dados.slug));
      await definirCampo(contactId, CAMPO_QR_CODE, dados.qrUrl);
      if (flowAprovado) await dispararFlow(contactId, flowAprovado);
      if (flowQr) await dispararFlow(contactId, flowQr);
    });
  } catch (erro) {
    console.error("Falha ao enviar entrega por WhatsApp:", erro);
  }
}
