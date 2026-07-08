"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import { gerarCodigoLogin } from "@/lib/login-code";
import { enviarEmail } from "@/lib/email";
import { criarSessao, encerrarSessao, sessaoAtual } from "@/lib/session";
import { uploadFoto, removerFotoPorUrl } from "@/lib/storage";
import { limiteFotos, mostraPersonalidadeEHistorico, saudeApenasEssencial } from "@/lib/plano";
import type {
  BlocoAlimentacao,
  BlocoPersonalidadeRotina,
  BlocoSaude,
  EventoHistorico,
  Foto,
  Plano,
} from "@/lib/types/card";

const CODIGO_VALIDADE_MIN = 10;

/**
 * Pede um código de acesso por e-mail. Resposta é sempre genérica — não
 * revelamos se o e-mail tem ou não um card pago (evita enumeração).
 */
export async function solicitarCodigo(formData: FormData): Promise<{ mensagem: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Informe um e-mail válido.");
  }

  const { data: pedidoPago } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("owner_email", email)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();

  if (pedidoPago) {
    const codigo = gerarCodigoLogin();
    const expiresAt = new Date(Date.now() + CODIGO_VALIDADE_MIN * 60 * 1000).toISOString();
    await supabaseAdmin.from("login_codes").insert({ email, code: codigo, expires_at: expiresAt });
    await enviarEmail({
      to: email,
      subject: `${codigo} é o seu código de acesso PetBio`,
      html: `<p>Seu código de acesso à área do cliente PetBio é:</p>
             <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${codigo}</p>
             <p>Ele expira em ${CODIGO_VALIDADE_MIN} minutos. Se você não pediu esse código, ignore este e-mail.</p>`,
    });
  }

  return {
    mensagem:
      "Se esse e-mail tiver um card do PetBio pago, enviamos um código de 6 dígitos. Confira sua caixa de entrada (e o spam).",
  };
}

/** Confirma o código e cria a sessão. Redireciona para /conta em caso de sucesso. */
export async function verificarCodigo(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const codigo = String(formData.get("codigo") || "").trim();
  if (!email || !codigo) {
    throw new Error("Informe e-mail e código.");
  }

  const { data: registro } = await supabaseAdmin
    .from("login_codes")
    .select("id, expires_at, used_at")
    .eq("email", email)
    .eq("code", codigo)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!registro || registro.used_at || new Date(registro.expires_at) < new Date()) {
    throw new Error("Código inválido ou expirado.");
  }

  await supabaseAdmin.from("login_codes").update({ used_at: new Date().toISOString() }).eq("id", registro.id);
  await criarSessao(email);
  redirect("/conta");
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/conta/entrar");
}

interface FotoManifestoUrl {
  tipo: "url";
  valor: string;
}
interface FotoManifestoArquivo {
  tipo: "arquivo";
  indice: number;
}
type FotoManifesto = FotoManifestoUrl | FotoManifestoArquivo;

async function resolverFotos(
  formData: FormData,
  manifesto: FotoManifesto[],
  prefixo: string,
  nomePet: string,
  limite: number,
): Promise<Foto[]> {
  const resultado: Foto[] = [];
  for (const item of manifesto.slice(0, limite)) {
    if (item.tipo === "url") {
      resultado.push({ url: item.valor, alt: nomePet });
      continue;
    }
    const file = formData.get(`fotoArquivo${item.indice}`);
    if (file instanceof File) {
      const url = await uploadFoto(prefixo, file, `extra-${item.indice}`);
      resultado.push({ url, alt: nomePet });
    }
  }
  return resultado;
}

/**
 * Atualiza um card pago do dono logado. Ownership é verificado aqui (não
 * existe policy pública de escrita — a checagem de aplicação é a barreira de
 * segurança, mesmo padrão já usado em app/criar/actions.ts). Respeita os
 * limites do plano (fotos, saúde essencial, personalidade/histórico) mesmo
 * que o dono tente mandar mais do que o plano permite.
 */
export async function atualizarCard(cardId: string, formData: FormData): Promise<void> {
  const sessao = await sessaoAtual();
  if (!sessao) throw new Error("Sua sessão expirou. Faça login de novo.");

  const { data: card } = await supabaseAdmin
    .from("cards")
    .select("id, slug, identidade, saude, personalidade_rotina, historico, order:orders(owner_email, status, plan)")
    .eq("id", cardId)
    .maybeSingle();

  const order = card?.order as unknown as { owner_email: string | null; status: string; plan: Plano | null } | null;

  if (!card || !order || order.owner_email !== sessao.email || order.status !== "paid") {
    throw new Error("Você não tem permissão para editar este card.");
  }

  const plano = order.plan;
  const dadosRaw = formData.get("dados");
  if (typeof dadosRaw !== "string") throw new Error("Dados ausentes.");

  const dados = JSON.parse(dadosRaw) as {
    identidade: Record<string, unknown> & { nome?: string; especie?: string };
    alimentacao: BlocoAlimentacao;
    saude: BlocoSaude;
    personalidade_rotina: BlocoPersonalidadeRotina;
    historico: EventoHistorico[];
  };

  if (!dados.identidade?.nome || !dados.identidade?.especie) {
    throw new Error("Nome e espécie do pet são obrigatórios.");
  }

  const identidadeAnterior = card.identidade as { foto_principal?: Foto; fotos?: Foto[] };
  const urlsAnteriores = [
    identidadeAnterior.foto_principal?.url,
    ...(identidadeAnterior.fotos?.map((f) => f.url) ?? []),
  ].filter((u): u is string => !!u);

  let fotoPrincipal: Foto | undefined;
  const fotoPrincipalFile = formData.get("fotoPrincipal");
  if (fotoPrincipalFile instanceof File) {
    fotoPrincipal = { url: await uploadFoto(card.slug, fotoPrincipalFile, "principal"), alt: dados.identidade.nome };
  } else {
    const urlExistente = formData.get("fotoPrincipalUrl");
    if (typeof urlExistente === "string" && urlExistente) {
      fotoPrincipal = { url: urlExistente, alt: dados.identidade.nome };
    }
  }

  const manifesto = JSON.parse(String(formData.get("fotosManifesto") || "[]")) as FotoManifesto[];
  const fotos = await resolverFotos(formData, manifesto, card.slug, dados.identidade.nome, limiteFotos(plano));

  const urlsFinais = new Set([fotoPrincipal?.url, ...fotos.map((f) => f.url)].filter(Boolean) as string[]);
  const urlsRemovidas = urlsAnteriores.filter((u) => !urlsFinais.has(u));
  await Promise.all(urlsRemovidas.map(removerFotoPorUrl));

  const essencial = saudeApenasEssencial(plano);
  const mostraCompleto = mostraPersonalidadeEHistorico(plano);

  // Blocos/campos que o plano não mostra no editor não podem ser apagados
  // por uma edição nos campos que ELE mostra — o quiz sempre coletou tudo
  // (docs/QUIZ.md), então um dono do Simples que só corrige o telefone do
  // vet não pode, sem querer, zerar clínica de emergência/medicações que já
  // existiam. Por isso preservamos o valor anterior do banco nesses campos
  // em vez de aceitar o que o cliente mandou (ele nem tem UI pra mandar
  // isso certo, já que o editor esconde esses campos do dono do Simples).
  const saude: BlocoSaude = essencial
    ? {
        ...card.saude,
        vet_nome: dados.saude.vet_nome,
        vet_telefone: dados.saude.vet_telefone,
        vacinas: dados.saude.vacinas,
        condicoes: dados.saude.condicoes,
      }
    : dados.saude;

  const { error } = await supabaseAdmin
    .from("cards")
    .update({
      identidade: { ...dados.identidade, foto_principal: fotoPrincipal, fotos },
      alimentacao: dados.alimentacao,
      saude,
      personalidade_rotina: mostraCompleto ? dados.personalidade_rotina : card.personalidade_rotina,
      historico: mostraCompleto ? dados.historico : card.historico,
    })
    .eq("id", cardId);

  if (error) throw new Error(`Falha ao salvar: ${error.message}`);

  revalidatePath(`/${card.slug}`);
  revalidatePath(`/conta/${cardId}`);
}
