import type { CardComPedido } from "@/lib/types/card";
import { limiteFotos, mostraPersonalidadeEHistorico, saudeApenasEssencial } from "@/lib/plano";
import { BlocoIdentidade } from "./BlocoIdentidade";
import { BlocoAlimentacao } from "./BlocoAlimentacao";
import { BlocoSaude } from "./BlocoSaude";
import { BlocoPersonalidadeRotina } from "./BlocoPersonalidadeRotina";
import { BlocoHistorico } from "./BlocoHistorico";
import { MarcaDagua } from "./MarcaDagua";
import { BotaoCompartilhar } from "./BotaoCompartilhar";
import { BotoesCompra } from "./BotoesCompra";

export function CardView({ card }: { card: CardComPedido }) {
  const plano = card.order.plan;
  const mostraCompleto = mostraPersonalidadeEHistorico(plano);

  return (
    <main className="relative mx-auto min-h-screen max-w-md px-4 pb-12">
      {card.is_watermarked && <MarcaDagua />}

      <div className="flex items-center justify-between py-4">
        <span className="text-sm font-semibold text-neutral-500">PetBio</span>
        <BotaoCompartilhar habilitado={!card.is_watermarked} />
      </div>

      {card.is_watermarked && (
        <>
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Esta é uma prévia. Compre para liberar o link compartilhável, o QR Code
            e a edição.
          </p>
          <BotoesCompra orderCode={card.order.order_code} />
        </>
      )}

      <BlocoIdentidade identidade={card.identidade} limiteFotos={limiteFotos(plano)} />
      <BlocoAlimentacao alimentacao={card.alimentacao} />
      <BlocoSaude saude={card.saude} essencial={saudeApenasEssencial(plano)} />
      {mostraCompleto && (
        <>
          <BlocoPersonalidadeRotina bloco={card.personalidade_rotina} />
          <BlocoHistorico eventos={card.historico} />
        </>
      )}
    </main>
  );
}
