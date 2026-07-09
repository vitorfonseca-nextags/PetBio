"use client";

import { useState, useTransition } from "react";
import type {
  BlocoAlimentacao,
  BlocoPersonalidadeRotina,
  BlocoSaude,
  EventoHistorico,
} from "@/lib/types/card";
import { limiteFotos } from "@/lib/plano";
import { EXEMPLOS } from "@/lib/quiz/exemplos";
import { Campo } from "@/components/quiz/Campo";
import { Select } from "@/components/quiz/Select";
import { SeletorFotoPrincipal, SeletorFotosExtras } from "@/components/quiz/SeletorFoto";
import { ListaMedicacoes } from "@/components/quiz/ListaMedicacoes";
import { ListaHistorico } from "@/components/quiz/ListaHistorico";
import { Progresso } from "@/components/quiz/Progresso";
import { criarPedido } from "./actions";

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
  fotoPrincipal: File | null;
  fotos: File[];
}

const IDENTIDADE_INICIAL: IdentidadeForm = {
  nome: "",
  apelido: "",
  especie: "",
  raca: "",
  sexo: "",
  nascimento: "",
  idade_aproximada: "",
  porte: "",
  cores: "",
  marcas_distintivas: "",
  fotoPrincipal: null,
  fotos: [],
};

const ALIMENTACAO_INICIAL: BlocoAlimentacao = {
  racao_marca_tipo: "",
  quantidade: "",
  horarios: "",
  petiscos: "",
  proibidos: "",
  onde_fica: "",
};

const SAUDE_INICIAL: BlocoSaude = {
  vet_nome: "",
  vet_telefone: "",
  clinica_emergencia: "",
  vacinas: "",
  condicoes: "",
  medicacoes: [],
};

const PERSONALIDADE_INICIAL: BlocoPersonalidadeRotina = {
  temperamento: "",
  medos: "",
  manias: "",
  comandos: "",
  rotina_passeio: "",
  rotina_sono: "",
  brinquedos: "",
  lugares_favoritos: "",
};

// O quiz não pergunta plano — coleta tudo, como se fosse o Completo. O corte
// por plano só acontece na renderização, depois da compra (ver docs/QUIZ.md).
const PASSOS = [
  { chave: "identidade", icone: "🐾", titulo: "Identidade" },
  { chave: "alimentacao", icone: "🍖", titulo: "Alimentação" },
  { chave: "saude", icone: "🩺", titulo: "Saúde" },
  { chave: "personalidade", icone: "🎾", titulo: "Personalidade" },
  { chave: "historico", icone: "🕰️", titulo: "Histórico" },
  { chave: "contato", icone: "📱", titulo: "Contato" },
];
const LIMITE_FOTOS_QUIZ = limiteFotos(null);

export default function QuizPage() {
  const [passoIndex, setPassoIndex] = useState(0);
  const [identidade, setIdentidade] = useState<IdentidadeForm>(IDENTIDADE_INICIAL);
  const [alimentacao, setAlimentacao] = useState<BlocoAlimentacao>(ALIMENTACAO_INICIAL);
  const [saude, setSaude] = useState<BlocoSaude>(SAUDE_INICIAL);
  const [tomaMedicacao, setTomaMedicacao] = useState(false);
  const [personalidade, setPersonalidade] = useState<BlocoPersonalidadeRotina>(PERSONALIDADE_INICIAL);
  const [historico, setHistorico] = useState<EventoHistorico[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, startTransition] = useTransition();

  const passoAtual = PASSOS[passoIndex].chave;

  function podeAvancar(): boolean {
    switch (passoAtual) {
      case "identidade":
        return identidade.nome.trim() !== "" && identidade.especie.trim() !== "";
      case "contato":
        return whatsapp.trim().length >= 8;
      default:
        return true;
    }
  }

  function avancar() {
    setErro(null);
    if (!podeAvancar()) {
      setErro("Preencha os campos obrigatórios antes de continuar.");
      return;
    }
    setPassoIndex((i) => Math.min(i + 1, PASSOS.length - 1));
  }

  function voltar() {
    setErro(null);
    setPassoIndex((i) => Math.max(i - 1, 0));
  }

  function enviar() {
    if (!podeAvancar()) {
      setErro("Preencha os campos obrigatórios antes de continuar.");
      return;
    }
    setErro(null);

    const fd = new FormData();
    fd.append("whatsapp", whatsapp.trim());
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
    if (identidade.fotoPrincipal) fd.append("fotoPrincipal", identidade.fotoPrincipal);
    identidade.fotos.forEach((f) => fd.append("fotos", f));

    startTransition(async () => {
      try {
        await criarPedido(fd);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao criar o card. Tente de novo.");
      }
    });
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-cream px-4 pb-16">
      <h1 className="pt-6 text-xl font-extrabold text-ink">Criar o PetBio do seu pet</h1>
      <p className="mt-1 text-sm text-ink-soft">Leva uns 5 minutos — sem enrolação.</p>
      <Progresso atual={passoIndex} total={PASSOS.length} />

      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm">
          {PASSOS[passoIndex].icone}
        </span>
        <h2 className="text-base font-extrabold text-ink">{PASSOS[passoIndex].titulo}</h2>
      </div>

      {passoAtual === "identidade" && (
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
            placeholder="Cachorro, gato..."
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
            label="Idade aproximada (se não souber a data)"
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
          <SeletorFotoPrincipal
            arquivo={identidade.fotoPrincipal}
            onChange={(f) => setIdentidade((s) => ({ ...s, fotoPrincipal: f }))}
          />
          <SeletorFotosExtras
            arquivos={identidade.fotos}
            limite={LIMITE_FOTOS_QUIZ}
            onChange={(fotos) => setIdentidade((s) => ({ ...s, fotos }))}
          />
        </div>
      )}

      {passoAtual === "alimentacao" && (
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
      )}

      {passoAtual === "saude" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">
            Pra quem for cuidar do seu pet saber o que fazer numa emergência.
          </p>
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
          <Campo
            label="Clínica de emergência"
            value={saude.clinica_emergencia ?? ""}
            onChange={(v) => setSaude((s) => ({ ...s, clinica_emergencia: v }))}
          />
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 py-1 text-sm font-bold text-ink">
              <input
                type="checkbox"
                checked={tomaMedicacao}
                onChange={(e) => setTomaMedicacao(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
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
        </div>
      )}

      {passoAtual === "personalidade" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">
            O que faz o seu pet ser único — opcional, mas deixa o card mais gostoso de ler.
          </p>
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
      )}

      {passoAtual === "historico" && (
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">
            Eventos marcantes da vida do seu pet — opcional, pode pular e adicionar depois.
          </p>
          <ListaHistorico eventos={historico} onChange={setHistorico} />
        </div>
      )}

      {passoAtual === "contato" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">Pra onde mandamos o link da prévia — na hora, sem espera.</p>
          <Campo
            label="WhatsApp do dono"
            required
            tipo="tel"
            placeholder="(11) 90000-0000"
            value={whatsapp}
            onChange={setWhatsapp}
          />
        </div>
      )}

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      <div className="flex gap-3 pt-5">
        {passoIndex > 0 && (
          <button
            type="button"
            onClick={voltar}
            disabled={enviando}
            className="rounded-full border border-line px-5 py-3 text-sm font-bold text-ink-soft"
          >
            Voltar
          </button>
        )}
        {passoAtual !== "contato" ? (
          <button
            type="button"
            onClick={avancar}
            className="ml-auto rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_24px_-12px_rgba(232,112,58,0.55)]"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={enviar}
            disabled={enviando}
            className="ml-auto rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_24px_-12px_rgba(232,112,58,0.55)] disabled:opacity-60"
          >
            {enviando ? "Criando..." : "Criar meu PetBio"}
          </button>
        )}
      </div>
    </main>
  );
}
