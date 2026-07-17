"use client";

import { useState, useTransition } from "react";
import { solicitarCodigo, verificarCodigo } from "../actions";
import { SeloCayen } from "@/components/marca/SeloCayen";

export default function EntrarPage() {
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, startTransition] = useTransition();

  function pedirCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("email", email);
        const res = await solicitarCodigo(fd);
        setMensagem(res.mensagem);
        setEtapa("codigo");
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao pedir o código.");
      }
    });
  }

  function confirmarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("email", email);
        fd.append("codigo", codigo);
        await verificarCodigo(fd);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao confirmar o código.");
      }
    });
  }

  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-cream lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-gradient-to-br from-brand-400 to-brand-600 p-16 text-white lg:flex">
        <div className="flex items-center gap-2">
          <p className="text-3xl font-extrabold">
            pet<span className="text-white/80">bio</span>
          </p>
          <SeloCayen chip imgClassName="h-9" />
        </div>
        <h1 className="mt-6 max-w-sm text-2xl font-extrabold text-balance xl:text-3xl">
          Todos os dados do seu pet, sempre à mão.
        </h1>
        <p className="mt-3 max-w-sm text-white/85">
          Entre com o e-mail usado na compra pra editar o card do seu pet quando
          quiser.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 lg:hidden">
            <p className="text-center text-xl font-extrabold text-ink">
              pet<span className="text-brand-600">bio</span>
            </p>
            <SeloCayen />
          </div>
          <h1 className="mt-6 text-center text-lg font-extrabold text-ink lg:mt-0 lg:text-left lg:text-2xl">
            Entrar na área do cliente
          </h1>
          <p className="mt-1 text-center text-[13px] text-ink-soft lg:text-left">
            Use o e-mail que você informou na compra do PetBio.
          </p>

          {etapa === "email" && (
            <form onSubmit={pedirCodigo} className="mt-6 space-y-3">
              <div className="space-y-1">
                <label htmlFor="email" className="text-[13px] font-bold text-ink">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-ink focus:border-brand-600 focus:outline-none"
                  placeholder="voce@email.com"
                />
              </div>
              {erro && <p className="text-[13px] text-red-600">{erro}</p>}
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_24px_-12px_rgba(232,112,58,0.55)] disabled:opacity-60"
              >
                {enviando ? "Enviando..." : "Enviar código"}
              </button>
            </form>
          )}

          {etapa === "codigo" && (
            <form onSubmit={confirmarCodigo} className="mt-6 space-y-3">
              {mensagem && <p className="rounded-xl bg-sage-tint px-3 py-2 text-[13px] text-sage">{mensagem}</p>}
              <div className="space-y-1">
                <label htmlFor="codigo" className="text-[13px] font-bold text-ink">
                  Código de 6 dígitos
                </label>
                <input
                  id="codigo"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-center text-lg font-extrabold tracking-[0.5em] text-ink focus:border-brand-600 focus:outline-none"
                  placeholder="000000"
                />
              </div>
              {erro && <p className="text-[13px] text-red-600">{erro}</p>}
              <button
                type="submit"
                disabled={enviando || codigo.length !== 6}
                className="w-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_24px_-12px_rgba(232,112,58,0.55)] disabled:opacity-60"
              >
                {enviando ? "Confirmando..." : "Confirmar"}
              </button>
              <button
                type="button"
                onClick={() => setEtapa("email")}
                className="w-full text-center text-[13px] font-bold text-ink-soft"
              >
                Usar outro e-mail
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
