"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type {
  BlocoAlimentacao,
  BlocoPersonalidadeRotina,
  BlocoSaude,
  Card,
  EventoHistorico,
  Plano,
} from "@/lib/types/card";
import { limiteFotos, mostraPersonalidadeEHistorico, saudeApenasEssencial } from "@/lib/plano";
import { EXEMPLOS } from "@/lib/quiz/exemplos";
import { Campo } from "@/components/quiz/Campo";
import { Select } from "@/components/quiz/Select";
import { ListaMedicacoes } from "@/components/quiz/ListaMedicacoes";
import { ListaHistorico } from "@/components/quiz/ListaHistorico";
import { BlocoExpansivel } from "@/components/card/BlocoExpansivel";
import { EditorFotoPrincipal, EditorFotosExtras, type FotoEditavel } from "./EditorFotos";
import { atualizarCard } from "@/app/conta/actions";

interface IdentidadeForm {
  nome: string;
  apelido: string;
  especie: string;
  raca: string;
  sexo: "" | "macho" | "femea";
  nascimento: string;
  idade_aproximada: string;
  porte: "" | "pequeno" | "medio" | "grande";
  cores: string;
  marcas_distintivas: string;
}

export function EditorCard({ card, plano }: { card: Card; plano: Plano | null }) {
  const identidadeInicial = card.identidade as IdentidadeForm & {
    foto_principal?: { url: string };
    fotos?: { url: string }[];
  };

  const [identidade, setIdentidade] = useState<IdentidadeForm>({
    nome: identidadeInicial.nome ?? "",
    apelido: identidadeInicial.apelido ?? "",
    especie: identidadeInicial.especie ?? "",
    raca: identidadeInicial.raca ?? "",
    sexo: identidadeInicial.sexo ?? "",
    nascimento: identidadeInicial.nascimento ?? "",
    idade_aproximada: identidadeInicial.idade_aproximada ?? "",
    porte: identidadeInicial.porte ?? "",
    cores: identidadeInicial.cores ?? "",
    marcas_distintivas: identidadeInicial.marcas_distintivas ?? "",
  });
  const [fotoPrincipal, setFotoPrincipal] = useState<FotoEditavel | null>(
    identidadeInicial.foto_principal ? { url: identidadeInicial.foto_principal.url } : null,
  );
  const [fotos, setFotos] = useState<FotoEditavel[]>(
    (identidadeInicial.fotos ?? []).map((f) => ({ url: f.url })),
  );
  const [alimentacao, setAlimentacao] = useState<BlocoAlimentacao>(card.alimentacao ?? {});
  const [saude, setSaude] = useState<BlocoSaude>(card.saude ?? {});
  const [tomaMedicacao, setTomaMedicacao] = useState((card.saude?.medicacoes?.length ?? 0) > 0);
  const [personalidade, setPersonalidade] = useState<BlocoPersonalidadeRotina>(
    card.personalidade_rotina ?? {},
  );
  const [historico, setHistorico] = useState<EventoHistorico[]>(card.historico ?? []);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [salvando, startTransition] = useTransition();

  const essencial = saudeApenasEssencial(plano);
  const mostraCompleto = mostraPersonalidadeEHistorico(plano);
  const limite = limiteFotos(plano);

  function salvar() {
    if (!identidade.nome.trim() || !identidade.especie.trim()) {
      setErro("Nome e espécie são obrigatórios.");
      return;
    }
    setErro(null);
    setSalvo(false);

    const fd = new FormData();
    fd.append(
      "dados",
      JSON.stringify({
        identidade: {
          nome: identidade.nome,
          apelido: identidade.apelido || undefined,
          especie: identidade.especie,
          raca: identidade.raca || undefined,
          sexo: identidade.sexo || undefined,
          nascimento: identidade.nascimento || undefined,
          idade_aproximada: identidade.idade_aproximada || undefined,
          porte: identidade.porte || undefined,
          cores: identidade.cores || undefined,
          marcas_distintivas: identidade.marcas_distintivas || undefined,
        },
        alimentacao,
        saude: { ...saude, medicacoes: tomaMedicacao ? saude.medicacoes : [] },
        personalidade_rotina: personalidade,
        historico,
      }),
    );

    if (fotoPrincipal?.file) fd.append("fotoPrincipal", fotoPrincipal.file);
    else if (fotoPrincipal?.url) fd.append("fotoPrincipalUrl", fotoPrincipal.url);

    const manifesto = fotos.map((foto, i) => {
      if (foto.file) {
        fd.append(`fotoArquivo${i}`, foto.file);
        return { tipo: "arquivo", indice: i };
      }
      return { tipo: "url", valor: foto.url };
    });
    fd.append("fotosManifesto", JSON.stringify(manifesto));

    startTransition(async () => {
      try {
        await atualizarCard(card.id, fd);
        setSalvo(true);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao salvar. Tente de novo.");
      }
    });
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-cream pb-4">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/conta" className="text-[13px] font-bold text-ink-soft">
          ← Seus cards
        </Link>
        <Link href={`/${card.slug}`} target="_blank" className="text-[13px] font-bold text-brand-600">
          Ver público
        </Link>
      </div>
      <div className="px-4">
        <h1 className="text-xl font-extrabold text-ink">Editar {identidade.nome || "seu pet"}</h1>
        <span className="mt-1.5 inline-block rounded-full bg-sage-tint px-2.5 py-1 text-[10px] font-extrabold text-sage">
          Plano {plano === "completo" ? "Completo" : "Simples"}
        </span>
      </div>

      <div className="px-4">
        <BlocoExpansivel titulo="Identidade" icone="🐾" defaultAberto>
          <div className="space-y-4">
            <Campo
              label="Nome do pet"
              required
              value={identidade.nome}
              onChange={(v) => setIdentidade((s) => ({ ...s, nome: v }))}
            />
            <Campo
              label="Apelido"
              value={identidade.apelido}
              onChange={(v) => setIdentidade((s) => ({ ...s, apelido: v }))}
            />
            <Campo
              label="Espécie"
              required
              value={identidade.especie}
              onChange={(v) => setIdentidade((s) => ({ ...s, especie: v }))}
            />
            <Campo
              label="Raça"
              value={identidade.raca}
              onChange={(v) => setIdentidade((s) => ({ ...s, raca: v }))}
            />
            <Select
              label="Sexo"
              value={identidade.sexo}
              onChange={(v) => setIdentidade((s) => ({ ...s, sexo: v as IdentidadeForm["sexo"] }))}
              opcoes={[
                { valor: "", texto: "Prefiro não informar" },
                { valor: "macho", texto: "Macho" },
                { valor: "femea", texto: "Fêmea" },
              ]}
            />
            <Campo
              label="Data de nascimento"
              tipo="date"
              value={identidade.nascimento}
              onChange={(v) => setIdentidade((s) => ({ ...s, nascimento: v }))}
            />
            <Campo
              label="Idade aproximada"
              value={identidade.idade_aproximada}
              onChange={(v) => setIdentidade((s) => ({ ...s, idade_aproximada: v }))}
            />
            <Select
              label="Porte"
              value={identidade.porte}
              onChange={(v) => setIdentidade((s) => ({ ...s, porte: v as IdentidadeForm["porte"] }))}
              opcoes={[
                { valor: "", texto: "Selecione" },
                { valor: "pequeno", texto: "Pequeno" },
                { valor: "medio", texto: "Médio" },
                { valor: "grande", texto: "Grande" },
              ]}
            />
            <Campo
              label="Cores"
              value={identidade.cores}
              onChange={(v) => setIdentidade((s) => ({ ...s, cores: v }))}
            />
            <Campo
              label="Marcas distintivas"
              linhas={2}
              exemplo={EXEMPLOS.marcasDistintivas}
              value={identidade.marcas_distintivas}
              onChange={(v) => setIdentidade((s) => ({ ...s, marcas_distintivas: v }))}
            />
            <EditorFotoPrincipal foto={fotoPrincipal} onChange={setFotoPrincipal} />
            <EditorFotosExtras fotos={fotos} limite={limite} onChange={setFotos} />
          </div>
        </BlocoExpansivel>

        <BlocoExpansivel titulo="Alimentação" icone="🍖">
          <div className="space-y-4">
            <Campo
              label="Ração (marca e tipo)"
              exemplo={EXEMPLOS.racaoMarcaTipo}
              value={alimentacao.racao_marca_tipo ?? ""}
              onChange={(v) => setAlimentacao((s) => ({ ...s, racao_marca_tipo: v }))}
            />
            <Campo
              label="Quantidade"
              exemplo={EXEMPLOS.quantidade}
              value={alimentacao.quantidade ?? ""}
              onChange={(v) => setAlimentacao((s) => ({ ...s, quantidade: v }))}
            />
            <Campo
              label="Horários"
              exemplo={EXEMPLOS.horarios}
              value={alimentacao.horarios ?? ""}
              onChange={(v) => setAlimentacao((s) => ({ ...s, horarios: v }))}
            />
            <Campo
              label="Petiscos permitidos"
              exemplo={EXEMPLOS.petiscos}
              value={alimentacao.petiscos ?? ""}
              onChange={(v) => setAlimentacao((s) => ({ ...s, petiscos: v }))}
            />
            <Campo
              label="Alimentos proibidos"
              linhas={2}
              exemplo={EXEMPLOS.proibidos}
              value={alimentacao.proibidos ?? ""}
              onChange={(v) => setAlimentacao((s) => ({ ...s, proibidos: v }))}
            />
            <Campo
              label="Onde fica a comida"
              exemplo={EXEMPLOS.ondeFicaComida}
              value={alimentacao.onde_fica ?? ""}
              onChange={(v) => setAlimentacao((s) => ({ ...s, onde_fica: v }))}
            />
          </div>
        </BlocoExpansivel>

        <BlocoExpansivel titulo="Saúde" icone="🩺">
          <div className="space-y-4">
            <Campo
              label="Nome do veterinário"
              value={saude.vet_nome ?? ""}
              onChange={(v) => setSaude((s) => ({ ...s, vet_nome: v }))}
            />
            <Campo
              label="Telefone do veterinário"
              tipo="tel"
              value={saude.vet_telefone ?? ""}
              onChange={(v) => setSaude((s) => ({ ...s, vet_telefone: v }))}
            />
            <Campo
              label="Vacinas"
              linhas={2}
              exemplo={EXEMPLOS.vacinas}
              value={saude.vacinas ?? ""}
              onChange={(v) => setSaude((s) => ({ ...s, vacinas: v }))}
            />
            <Campo
              label="Condições de saúde"
              linhas={2}
              exemplo={EXEMPLOS.condicoesSaude}
              value={saude.condicoes ?? ""}
              onChange={(v) => setSaude((s) => ({ ...s, condicoes: v }))}
            />
            {essencial ? (
              <p className="rounded-xl bg-cream px-3 py-2 text-xs text-ink-soft">
                Clínica de emergência e medicações fazem parte do plano Completo.
              </p>
            ) : (
              <>
                <Campo
                  label="Clínica de emergência"
                  value={saude.clinica_emergencia ?? ""}
                  onChange={(v) => setSaude((s) => ({ ...s, clinica_emergencia: v }))}
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-ink">
                    <input
                      type="checkbox"
                      checked={tomaMedicacao}
                      onChange={(e) => setTomaMedicacao(e.target.checked)}
                    />
                    Toma alguma medicação regularmente?
                  </label>
                  {tomaMedicacao && (
                    <ListaMedicacoes
                      medicacoes={saude.medicacoes ?? []}
                      onChange={(medicacoes) => setSaude((s) => ({ ...s, medicacoes }))}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </BlocoExpansivel>

        {mostraCompleto && (
          <>
            <BlocoExpansivel titulo="Personalidade e rotina" icone="🎾">
              <div className="space-y-4">
                <Campo
                  label="Temperamento"
                  linhas={2}
                  exemplo={EXEMPLOS.temperamento}
                  value={personalidade.temperamento ?? ""}
                  onChange={(v) => setPersonalidade((s) => ({ ...s, temperamento: v }))}
                />
                <Campo
                  label="Medos"
                  exemplo={EXEMPLOS.medos}
                  value={personalidade.medos ?? ""}
                  onChange={(v) => setPersonalidade((s) => ({ ...s, medos: v }))}
                />
                <Campo
                  label="Manias"
                  exemplo={EXEMPLOS.manias}
                  value={personalidade.manias ?? ""}
                  onChange={(v) => setPersonalidade((s) => ({ ...s, manias: v }))}
                />
                <Campo
                  label="Comandos que conhece"
                  exemplo={EXEMPLOS.comandos}
                  value={personalidade.comandos ?? ""}
                  onChange={(v) => setPersonalidade((s) => ({ ...s, comandos: v }))}
                />
                <Campo
                  label="Rotina de passeio"
                  exemplo={EXEMPLOS.rotinaPasseio}
                  value={personalidade.rotina_passeio ?? ""}
                  onChange={(v) => setPersonalidade((s) => ({ ...s, rotina_passeio: v }))}
                />
                <Campo
                  label="Rotina de sono"
                  exemplo={EXEMPLOS.rotinaSono}
                  value={personalidade.rotina_sono ?? ""}
                  onChange={(v) => setPersonalidade((s) => ({ ...s, rotina_sono: v }))}
                />
                <Campo
                  label="Brinquedos favoritos"
                  exemplo={EXEMPLOS.brinquedos}
                  value={personalidade.brinquedos ?? ""}
                  onChange={(v) => setPersonalidade((s) => ({ ...s, brinquedos: v }))}
                />
                <Campo
                  label="Lugares favoritos"
                  exemplo={EXEMPLOS.lugaresFavoritos}
                  value={personalidade.lugares_favoritos ?? ""}
                  onChange={(v) => setPersonalidade((s) => ({ ...s, lugares_favoritos: v }))}
                />
              </div>
            </BlocoExpansivel>

            <BlocoExpansivel titulo="Histórico" icone="🕰️">
              <ListaHistorico eventos={historico} onChange={setHistorico} />
            </BlocoExpansivel>
          </>
        )}

        <div className="sticky bottom-0 mt-4 flex items-center gap-3 border-t border-line bg-cream/95 py-3 backdrop-blur">
          {erro && <p className="text-[13px] text-red-600">{erro}</p>}
          {salvo && !erro && <p className="text-[13px] font-bold text-sage">✓ Salvo</p>}
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="ml-auto rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_12px_20px_-10px_rgba(232,112,58,0.55)] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}
