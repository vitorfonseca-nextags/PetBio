export type Plano = "simples" | "completo";
export type OrderStatus = "draft" | "preview_sent" | "paid";

export interface Foto {
  url: string;
  alt?: string;
}

export interface BlocoIdentidade {
  nome: string;
  apelido?: string;
  especie: string;
  raca?: string;
  sexo?: "macho" | "femea";
  nascimento?: string;
  idade_aproximada?: string;
  porte?: "pequeno" | "medio" | "grande";
  cores?: string;
  marcas_distintivas?: string;
  foto_principal?: Foto;
  fotos?: Foto[];
}

export interface BlocoAlimentacao {
  racao_marca_tipo?: string;
  quantidade?: string;
  horarios?: string;
  petiscos?: string;
  proibidos?: string;
  onde_fica?: string;
}

export interface Medicacao {
  nome: string;
  dosagem?: string;
  frequencia?: string;
}

export interface BlocoSaude {
  vet_nome?: string;
  vet_telefone?: string;
  clinica_emergencia?: string;
  vacinas?: string;
  condicoes?: string;
  medicacoes?: Medicacao[];
}

export interface BlocoPersonalidadeRotina {
  temperamento?: string;
  medos?: string;
  manias?: string;
  comandos?: string;
  rotina_passeio?: string;
  rotina_sono?: string;
  brinquedos?: string;
  lugares_favoritos?: string;
}

export interface EventoHistorico {
  data: string;
  titulo: string;
  descricao?: string;
}

export type BlocoHistorico = EventoHistorico[];

export interface Card {
  id: string;
  order_id: string;
  slug: string;
  is_watermarked: boolean;
  qr_url: string | null;
  identidade: BlocoIdentidade;
  alimentacao: BlocoAlimentacao;
  saude: BlocoSaude;
  personalidade_rotina: BlocoPersonalidadeRotina;
  historico: BlocoHistorico;
  created_at: string;
  updated_at: string;
}

export interface CardComPedido extends Card {
  order: {
    order_code: string;
    status: OrderStatus;
    plan: Plano | null;
  };
}
