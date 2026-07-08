// Cria (de forma idempotente) a marca e os 2 produtos do PetBio na Yampi via
// API de administração. Rodar: npm run yampi:setup
// Precisa de YAMPI_MERCHANT_ALIAS / YAMPI_USER_TOKEN / YAMPI_USER_SECRET_KEY
// no .env.local — ver docs/YAMPI.md.

const alias = process.env.YAMPI_MERCHANT_ALIAS;
const userToken = process.env.YAMPI_USER_TOKEN;
const userSecretKey = process.env.YAMPI_USER_SECRET_KEY;

if (!alias || !userToken || !userSecretKey) {
  console.error(
    "Faltam YAMPI_MERCHANT_ALIAS / YAMPI_USER_TOKEN / YAMPI_USER_SECRET_KEY no .env.local",
  );
  process.exit(1);
}

const API_ROOT = "https://api.dooki.com.br/v2";
const BASE = `${API_ROOT}/${alias}`; // recursos da loja (catálogo, cupons...)
const HEADERS = {
  "Content-Type": "application/json",
  "User-Token": userToken,
  "User-Secret-Key": userSecretKey,
};

async function chamar(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${method} ${url} -> ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

// recursos da loja usam o alias na URL
const yampi = (method, path, body) => chamar(`${BASE}${path}`, method, body);

// O parâmetro ?search= da Yampi não filtra de verdade (ignora o valor) — pra
// achar algo existente por nome é preciso paginar e comparar no cliente.
async function buscarPorNomeExato(path, nome) {
  for (let page = 1; page <= 20; page++) {
    const resposta = await yampi("GET", `${path}?page=${page}`);
    const achado = resposta?.data?.find((item) => item.name === nome);
    if (achado) return achado;
    if (page >= (resposta?.meta?.pagination?.total_pages ?? 1)) break;
  }
  return null;
}

// /auth/me é global — não leva o alias da loja na URL
const me = await chamar(`${API_ROOT}/auth/me`, "POST");
console.log("Autenticado como:", me?.data?.name ?? me?.data?.email ?? JSON.stringify(me));

// 2. marca "PetBio" (reaproveita se já existir)
let brandId;
const marcaExistente = await buscarPorNomeExato("/catalog/brands", "PetBio");
if (marcaExistente) {
  brandId = marcaExistente.id;
  console.log("Marca PetBio já existe, id:", brandId);
} else {
  const criada = await yampi("POST", "/catalog/brands", {
    name: "PetBio",
    active: true,
    featured: false,
  });
  brandId = criada.data.id;
  console.log("Marca PetBio criada, id:", brandId);
}

// 3. produtos — criados INATIVOS de propósito (active: false). Você ativa
// manualmente no painel quando revisar e quiser deixar no ar de verdade.
const PRODUTOS = [
  {
    name: "PetBio Simples",
    preco: 10.0,
    descricao:
      "Card digital do seu pet — Identidade, Alimentação e Saúde essencial, até 3 fotos. Pagamento único.",
  },
  {
    name: "PetBio Completo",
    preco: 29.9,
    descricao:
      "Card digital do seu pet — todos os blocos (Identidade, Alimentação, Saúde, Personalidade/Rotina, Histórico), até 15 fotos. Pagamento único.",
  },
];

// Catálogo dessa loja tem dezenas de páginas de produtos — paginar tudo pra
// checar duplicata (como fizemos com a marca) estoura rate limit da Yampi
// (429). Em vez disso: tenta criar e trata "nome/sku já em uso" como sinal
// de que já existe, sem precisar descobrir o id.
for (const produto of PRODUTOS) {
  try {
    const criado = await yampi("POST", "/catalog/products", {
      simple: true,
      brand_id: brandId,
      active: false,
      searchable: false,
      is_digital: true,
      name: produto.name,
      description: produto.descricao,
      skus: [
        {
          sku: produto.name.toUpperCase().replace(/\s+/g, "-"),
          price_sale: produto.preco,
          price_cost: 0,
          quantity_managed: false,
          blocked_sale: false,
        },
      ],
    });
    console.log(`Produto "${produto.name}" criado, id: ${criado.data.id} (inativo — revise e ative no painel)`);
  } catch (err) {
    if (err.message.includes("já está em uso") || err.message.includes("422")) {
      console.log(`Produto "${produto.name}" provavelmente já existe (${err.message}) — pulando.`);
    } else {
      throw err;
    }
  }
}

console.log(
  "\nPronto. No painel: Produtos → abra cada produto → aba Resumo → copie o 'Link de compra' e cole no .env.local (NEXT_PUBLIC_YAMPI_CHECKOUT_SIMPLES / _COMPLETO). Ative o produto quando quiser que ele fique comprável de verdade.",
);
