const CHIPS = ["9 anos", "Fêmea", "Pequeno"];

const PARADAS_BLOCO = [
  {
    icone: "🩺",
    titulo: "Saúde",
    linhas: [
      { rotulo: "Veterinário", valor: "Dr. Marcelo Tanaka" },
      { rotulo: "Vacinas", valor: "Em dia" },
      { rotulo: "Condição", valor: "Braquicefálica leve" },
    ],
  },
  {
    icone: "🍖",
    titulo: "Alimentação",
    linhas: [
      { rotulo: "Ração", valor: "Light sênior" },
      { rotulo: "Horários", valor: "7h e 19h" },
      { rotulo: "Proibidos", valor: "Chocolate, uva" },
    ],
  },
  {
    icone: "🎾",
    titulo: "Personalidade",
    linhas: [
      { rotulo: "Temperamento", valor: "Dorminhoca" },
      { rotulo: "Manias", valor: "Esparrama no chão" },
      { rotulo: "Favorito", valor: "Colo" },
    ],
  },
];

/**
 * Prévia animada do card da Florentina (exemplo real, com autorização),
 * "passeando" pelas fotos e blocos como se alguém estivesse rolando a
 * página — mesma ideia da prévia interativa da Revivo no hero dela, mas sem
 * a cerimônia de toque (aqui é automático, olhando de fora).
 */
export function HeroMotion() {
  return (
    <div className="relative mx-auto h-[280px] w-full max-w-[300px] overflow-hidden rounded-[26px] border-[6px] border-white shadow-[0_16px_32px_-16px_rgba(46,32,24,0.35)]">
      <span className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-[#2E2018]/55 px-2.5 py-1 text-[9.5px] font-bold text-white">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
        prévia ao vivo
      </span>

      <div className="animate-passeio-card">
        {/* parada 1: fotos + nome */}
        <div className="h-[280px] bg-[#FBF2E4] p-4">
          <div className="relative mb-3 h-[108px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/florentina-bandana.jpg"
              alt="Florentina, pug fêmea de 9 anos"
              className="absolute inset-0 z-[-1] h-full w-full rotate-[-4deg] scale-[0.94] translate-y-1.5 rounded-[18px] object-cover object-[50%_25%] opacity-85"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/florentina-colo.jpg"
              alt="Florentina, pug fêmea de 9 anos"
              className="absolute inset-0 h-full w-full rounded-[18px] object-cover object-[15%_48%]"
            />
          </div>
          <h2 className="text-[17px] font-extrabold text-[#2E2018]">Florentina 🐾</h2>
          <p className="text-[11.5px] font-semibold text-[#93816F]">Flor · Pug</p>
          <div className="mt-2 flex gap-1.5">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#F1E1CD] bg-[#FBF2E4] px-2.5 py-1 text-[10px] font-bold text-[#2E2018]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* paradas 2–4: blocos */}
        {PARADAS_BLOCO.map((parada) => (
          <div key={parada.titulo} className="h-[280px] bg-[#FBF2E4] p-4">
            <div className="h-[200px] rounded-2xl bg-[#FBF2E4] p-3">
              <div className="mb-2.5 flex items-center gap-2 text-[13px] font-extrabold text-[#2E2018]">
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-[#FCE3D0] text-xs">
                  {parada.icone}
                </span>
                {parada.titulo}
              </div>
              {parada.linhas.map((linha, i) => (
                <div
                  key={linha.rotulo}
                  className={`flex justify-between py-1.5 text-[11px] ${i > 0 ? "border-t border-[#F1E1CD]" : ""}`}
                >
                  <span className="text-[#93816F]">{linha.rotulo}</span>
                  <span className="font-bold text-[#2E2018]">{linha.valor}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
