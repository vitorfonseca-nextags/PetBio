"use client";

import { useState, useTransition } from "react";
import { solicitarCodigo, verificarCodigo } from "../actions";

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
    <main className="mx-auto min-h-screen max-w-sm px-4 pt-16">
      <h1 className="text-xl font-bold">Entrar na área do cliente</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Use o e-mail que você informou na compra do PetBio.
      </p>

      {etapa === "email" && (
        <form onSubmit={pedirCodigo} className="mt-6 space-y-3">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-900">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              placeholder="voce@email.com"
            />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar código"}
          </button>
        </form>
      )}

      {etapa === "codigo" && (
        <form onSubmit={confirmarCodigo} className="mt-6 space-y-3">
          {mensagem && <p className="text-sm text-emerald-700">{mensagem}</p>}
          <div className="space-y-1">
            <label htmlFor="codigo" className="text-sm font-medium text-neutral-900">
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-center text-lg tracking-[0.5em]"
              placeholder="000000"
            />
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button
            type="submit"
            disabled={enviando || codigo.length !== 6}
            className="w-full rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {enviando ? "Confirmando..." : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => setEtapa("email")}
            className="w-full text-center text-sm text-neutral-500 underline"
          >
            Usar outro e-mail
          </button>
        </form>
      )}
    </main>
  );
}
