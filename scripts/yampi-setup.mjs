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

const BASE = `https://api.dooki.com.br/v2/${alias}`;
const HEADERS = {
  "Content-Type": "application/json",
  "User-Token": userToken,
  "User-Secret-Key": userSecretKey,
};

async function yampi(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

// 1. valida credenciais
const me = await yampi("POST", "/auth/me");
console.log("Autenticado como:", me?.data?.name ?? me?.data?.email ?? JSON.stringify(me));

// 2. marca "PetBio" (reaproveita se já existir)
let brandId;
const brands = await yampi("GET", "/catalog/brands?search=PetBio");
const existente = brands?.data?.find((b) => b.name === "PetBio");
if (existente) {
  brandId = existente.id;
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

for (const produto of PRODUTOS) {
  const jaExiste = await yampi(
    "GET",
    `/catalog/products?search=${encodeURIComponent(produto.name)}`,
  );
  if (jaExiste?.data?.some((p) => p.name === produto.name)) {
    console.log(`Produto "${produto.name}" já existe, pulando.`);
    continue;
  }

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
        quantity_managed: false,
        blocked_sale: false,
      },
    ],
  });
  console.log(`Produto "${produto.name}" criado, id: ${criado.data.id} (inativo — revise e ative no painel)`);
}

console.log(
  "\nPronto. No painel: Produtos → abra cada produto → aba Resumo → copie o 'Link de compra' e cole no .env.local (NEXT_PUBLIC_YAMPI_CHECKOUT_SIMPLES / _COMPLETO). Ative o produto quando quiser que ele fique comprável de verdade.",
);
