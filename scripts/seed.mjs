// Cria/atualiza cards-semente pra testar a Fase 2 sem precisar do quiz (Fase 3).
// Rodar: npm run seed  (lê NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY do .env.local)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey);

const foto = (n, alt) => ({ url: `/seed/paw-${n}.svg`, alt });
const fotoFlorentina = (arquivo, alt) => ({ url: `/marketing/florentina-${arquivo}.jpg`, alt });

const seeds = [
  {
    // Card-vitrine da Fase 8 (identidade visual) — fotos reais cedidas pelo
    // operador, com autorização, especificamente pra esse fim. Usado como
    // exemplo de "veja como fica" na LP.
    order: {
      order_code: "seed-florentina",
      status: "paid",
      plan: "completo",
      owner_whatsapp: "5511999990004",
      // dono de verdade (operador) — pra poder logar em /conta/entrar e ver
      // o card da Florentina como exemplo de "área do cliente" real.
      owner_email: "vitorfonseca@nextags.com.br",
    },
    card: {
      slug: "florentina",
      is_watermarked: false,
      identidade: {
        nome: "Florentina",
        apelido: "Flor",
        especie: "Cachorro",
        raca: "Pug",
        sexo: "femea",
        nascimento: "2017-03-10",
        porte: "pequeno",
        cores: "Fulvo, máscara preta",
        marcas_distintivas: "Mancha rosada no focinho",
        foto_principal: fotoFlorentina("banco", "Florentina sentada no banco de trás do carro"),
        fotos: [
          fotoFlorentina("colo", "Florentina no colo, contente"),
          fotoFlorentina("bandana", "Florentina cochilando de bandana no carro"),
          fotoFlorentina("sofa", "Florentina espichada no sofá"),
          fotoFlorentina("cobertor", "Florentina encolhida no cobertor"),
        ],
      },
      alimentacao: {
        racao_marca_tipo: "Ração light sênior, grãos pequenos",
        quantidade: "¾ de xícara, 2x ao dia",
        horarios: "7h e 19h",
        petiscos: "Cenoura crua, maçã sem semente",
        proibidos: "Chocolate, uva, ossos cozidos",
        onde_fica: "Armário perto da pia",
      },
      saude: {
        vet_nome: "Dr. Marcelo Tanaka",
        vet_telefone: "(11) 98888-4321",
        clinica_emergencia: "VetLife 24h — (11) 4000-1234",
        vacinas: "V8, antirrábica e gripe canina em dia (última: 02/2026)",
        condicoes: "Síndrome braquicefálica leve (ronca e cansa fácil no calor), sobrepeso controlado",
        medicacoes: [{ nome: "Colírio anti-inflamatório", dosagem: "1 gota", frequencia: "2x ao dia" }],
      },
      personalidade_rotina: {
        temperamento: "Dorminhoca e carinhosa, ronca alto até acordada",
        medos: "Aspirador de pó",
        manias: "Esparrama de pernas abertas no chão",
        comandos: "Senta, dá a pata",
        rotina_passeio: "2 voltas curtas por dia, evitando o calor",
        rotina_sono: "Dorme na cama dos donos, embaixo do travesseiro",
        brinquedos: "Bicho de pelúcia, bolinha que apita",
        lugares_favoritos: "Colo, tapete de sol na sala",
      },
      historico: [
        { data: "2017-03-10", titulo: "Nascimento" },
        { data: "2017-05-20", titulo: "Chegou em casa" },
        {
          data: "2023-08-15",
          titulo: "Cirurgia de correção do palato mole",
          descricao: "Comum em pugs — recuperação tranquila, respiração melhorou",
        },
        { data: "2025-11-01", titulo: "Início do colírio anti-inflamatório" },
      ],
    },
  },
  {
    order: {
      order_code: "seed-completo",
      status: "paid",
      plan: "completo",
      owner_whatsapp: "5511999990001",
    },
    card: {
      slug: "rex",
      is_watermarked: false,
      identidade: {
        nome: "Rex",
        apelido: "Rexinho",
        especie: "Cachorro",
        raca: "Labrador",
        sexo: "macho",
        nascimento: "2019-04-12",
        porte: "grande",
        cores: "Caramelo",
        marcas_distintivas: "Mancha branca no peito",
        foto_principal: foto(1, "Rex"),
        fotos: [foto(1, "Rex 1"), foto(2, "Rex 2"), foto(3, "Rex 3"), foto(4, "Rex 4"), foto(5, "Rex 5")],
      },
      alimentacao: {
        racao_marca_tipo: "Golden Fórmula — adulto grande porte",
        quantidade: "2 xícaras, 2x ao dia",
        horarios: "08h e 18h",
        petiscos: "Cenoura crua, biscoito sem corante",
        proibidos: "Chocolate, uva, cebola",
        onde_fica: "Armário da cozinha, prateleira de baixo",
      },
      saude: {
        vet_nome: "Dra. Ana Souza",
        vet_telefone: "(11) 90000-0001",
        clinica_emergencia: "PetEmergência 24h — (11) 4000-0000",
        vacinas: "V10 e antirrábica em dia (última: 03/2026)",
        condicoes: "Displasia leve de quadril",
        medicacoes: [{ nome: "Condroprotetor", dosagem: "1 comprimido", frequencia: "1x ao dia" }],
      },
      personalidade_rotina: {
        temperamento: "Dócil e brincalhão, adora crianças",
        medos: "Fogos de artifício",
        manias: "Esconde brinquedos embaixo do sofá",
        comandos: "Senta, fica, dá a pata",
        rotina_passeio: "2 passeios por dia, manhã e noite",
        rotina_sono: "Dorme na área de serviço",
        brinquedos: "Bolinha de tênis, corda",
        lugares_favoritos: "Praça perto de casa",
      },
      historico: [
        { data: "2019-04-12", titulo: "Nascimento" },
        { data: "2019-06-01", titulo: "Chegou em casa" },
        { data: "2023-01-15", titulo: "Cirurgia de castração", descricao: "Recuperação tranquila" },
      ],
    },
  },
  {
    order: {
      order_code: "seed-simples",
      status: "paid",
      plan: "simples",
      owner_whatsapp: "5511999990002",
    },
    card: {
      slug: "bidu",
      is_watermarked: false,
      identidade: {
        nome: "Bidu",
        especie: "Cachorro",
        raca: "Vira-lata",
        sexo: "macho",
        idade_aproximada: "3 anos",
        porte: "pequeno",
        foto_principal: foto(2, "Bidu"),
        fotos: [foto(2, "Bidu 1"), foto(3, "Bidu 2"), foto(4, "Bidu 3"), foto(5, "Bidu 4")],
      },
      alimentacao: {
        racao_marca_tipo: "Ração porte pequeno",
        quantidade: "1 xícara, 2x ao dia",
        onde_fica: "Cozinha",
      },
      saude: {
        vet_nome: "Dr. Carlos Lima",
        vet_telefone: "(11) 90000-0002",
        vacinas: "Em dia",
        condicoes: "Nenhuma condição registrada",
        // clinica_emergencia e medicacoes existem no schema mas não aparecem no plano Simples
        clinica_emergencia: "PetEmergência 24h — (11) 4000-0000",
        medicacoes: [],
      },
      personalidade_rotina: {},
      historico: [],
    },
  },
  {
    order: {
      order_code: "seed-previa",
      status: "preview_sent",
      plan: null,
      owner_whatsapp: "5511999990003",
    },
    card: {
      slug: "seed-previa",
      is_watermarked: true,
      identidade: {
        nome: "Mel",
        especie: "Gata",
        raca: "SRD",
        sexo: "femea",
        porte: "pequeno",
        foto_principal: foto(3, "Mel"),
        fotos: [foto(3, "Mel 1"), foto(4, "Mel 2")],
      },
      alimentacao: {
        racao_marca_tipo: "Ração para gatos castrados",
        horarios: "Fica à vontade (comedouro automático)",
      },
      saude: {
        vet_nome: "Dra. Ana Souza",
        vacinas: "Tríplice felina em dia",
      },
      personalidade_rotina: {
        temperamento: "Independente, gosta de altura",
      },
      historico: [{ data: "2024-02-01", titulo: "Adoção" }],
    },
  },
];

for (const { order, card } of seeds) {
  const { data: existingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("order_code", order.order_code)
    .maybeSingle();

  let orderId = existingOrder?.id;
  if (orderId) {
    await admin.from("orders").update(order).eq("id", orderId);
  } else {
    const { data, error } = await admin.from("orders").insert(order).select("id").single();
    if (error) throw error;
    orderId = data.id;
  }

  const { data: existingCard } = await admin
    .from("cards")
    .select("id")
    .eq("slug", card.slug)
    .maybeSingle();

  if (existingCard) {
    await admin.from("cards").update({ ...card, order_id: orderId }).eq("id", existingCard.id);
  } else {
    const { error } = await admin.from("cards").insert({ ...card, order_id: orderId });
    if (error) throw error;
  }

  console.log(`seed ok: /${card.slug}`);
}
