import type { CardComPedido } from "@/lib/types/card";
import { limiteFotos, mostraPersonalidadeEHistorico, saudeApenasEssencial } from "@/lib/plano";
import { urlPublica } from "@/lib/site-url";
import { formatarTempoRelativo } from "@/lib/tempo";
import { BlocoIdentidade } from "./BlocoIdentidade";
import { BlocoAlimentacao } from "./BlocoAlimentacao";
import { BlocoSaude } from "./BlocoSaude";
import { BlocoPersonalidadeRotina } from "./BlocoPersonalidadeRotina";
import { BlocoHistorico } from "./BlocoHistorico";
import { MarcaDagua } from "./MarcaDagua";
import { BotaoCompartilhar } from "./BotaoCompartilhar";
import { BotoesCompra } from "./BotoesCompra";
import { SeloCayen } from "@/components/marca/SeloCayen";

export function CardView({ card }: { card: CardComPedido }) {
  const plano = card.order.plan;
  const mostraCompleto = mostraPersonalidadeEHistorico(plano);

  return (
    <main className="relative min-h-screen w-full bg-cream pb-10">
      {card.is_watermarked && <MarcaDagua />}

      <div className="sticky top-0 z-10 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-ink">
              pet<span className="text-brand-600">bio</span>
            </span>
            <SeloCayen imgClassName="h-5" />
          </div>
          <BotaoCompartilhar habilitado={!card.is_watermarked} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {card.is_watermarked && (
          <div className="mx-auto max-w-md lg:max-w-none">
            <p className="mb-1 mt-4 rounded-xl bg-brand-50 px-3 py-2.5 text-[13px] text-brand-700 lg:mx-auto lg:max-w-md">
              Esta é uma prévia. Compre para liberar o link compartilhável, o QR Code e a edição.
            </p>
            <div className="lg:mx-auto lg:max-w-md">
              <BotoesCompra orderCode={card.order.order_code} />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-md lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-[380px_1fr] lg:items-start lg:gap-10 lg:pt-6">
          <div className="lg:sticky lg:top-24">
            <BlocoIdentidade identidade={card.identidade} limiteFotos={limiteFotos(plano)} />
          </div>

          <div>
            <BlocoAlimentacao alimentacao={card.alimentacao} />
            <BlocoSaude saude={card.saude} essencial={saudeApenasEssencial(plano)} />
            {mostraCompleto && (
              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                <BlocoPersonalidadeRotina bloco={card.personalidade_rotina} />
                <BlocoHistorico eventos={card.historico} />
              </div>
            )}

            {!card.is_watermarked && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 p-4 text-white">
                {card.qr_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.qr_url}
                    alt="QR Code do card"
                    className="h-14 w-14 shrink-0 rounded-lg bg-white p-1"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/20 text-2xl">
                    ▦
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">{urlPublica(card.slug).replace(/^https?:\/\//, "")}</p>
                  <p className="text-[11px] opacity-85">
                    Atualizado {formatarTempoRelativo(card.updated_at)} · edição só pelo dono
                  </p>
                </div>
              </div>
            )}

            <p className="py-6 text-center text-[11px] text-ink-soft lg:text-left">Feito com PetBio 🐾</p>
          </div>
        </div>
      </div>
    </main>
  );
}
