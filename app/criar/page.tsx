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
const PASSOS = ["identidade", "alimentacao", "saude", "personalidade", "historico", "contato"];
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

  const passoAtual = PASSOS[passoIndex];

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
    <main className="mx-auto min-h-screen max-w-md px-4 pb-16">
      <h1 className="pt-6 text-xl font-bold">Criar o PetBio do seu pet</h1>
      <Progresso atual={passoIndex} total={PASSOS.length} />

      {passoAtual === "identidade" && (
        <div className="space-y-4 py-4">
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
          <div className="space-y-1">
            <label htmlFor="identidade-sexo" className="text-sm font-medium text-neutral-900">
              Sexo
            </label>
            <select
              id="identidade-sexo"
              value={identidade.sexo}
              onChange={(e) =>
                setIdentidade((s) => ({ ...s, sexo: e.target.value as IdentidadeForm["sexo"] }))
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">Prefiro não dizer</option>
              <option value="macho">Macho</option>
              <option value="femea">Fêmea</option>
            </select>
          </div>
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
          <div className="space-y-1">
            <label htmlFor="identidade-porte" className="text-sm font-medium text-neutral-900">
              Porte
            </label>
            <select
              id="identidade-porte"
              value={identidade.porte}
              onChange={(e) =>
                setIdentidade((s) => ({ ...s, porte: e.target.value as IdentidadeForm["porte"] }))
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione</option>
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </div>
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
        <div className="space-y-4 py-4">
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
        <div className="space-y-4 py-4">
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
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-900">
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
        </div>
      )}

      {passoAtual === "personalidade" && (
        <div className="space-y-4 py-4">
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
        <div className="space-y-3 py-4">
          <p className="text-sm text-neutral-600">
            Eventos marcantes da vida do seu pet (opcional — pode pular e adicionar depois).
          </p>
          <ListaHistorico eventos={historico} onChange={setHistorico} />
        </div>
      )}

      {passoAtual === "contato" && (
        <div className="space-y-4 py-4">
          <p className="text-sm text-neutral-600">
            Pra onde mandamos o link de prévia do card assim que ele ficar pronto.
          </p>
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

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="flex gap-3 pt-4">
        {passoIndex > 0 && (
          <button
            type="button"
            onClick={voltar}
            disabled={enviando}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium"
          >
            Voltar
          </button>
        )}
        {passoAtual !== "contato" ? (
          <button
            type="button"
            onClick={avancar}
            className="ml-auto rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={enviar}
            disabled={enviando}
            className="ml-auto rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {enviando ? "Criando..." : "Criar meu PetBio"}
          </button>
        )}
      </div>
    </main>
  );
}
