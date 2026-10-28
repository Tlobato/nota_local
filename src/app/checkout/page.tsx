"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import {
  ShieldCheck,
  Check,
  Lock,
  CreditCard,
  QrCode,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const formatPhoneMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpfCnpjMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");

  const [form, setForm] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    phone: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("plan") === "monthly") {
        setPlan("monthly");
      } else if (params.get("plan") === "annual") {
        setPlan("annual");
      }
    }
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar checkout.");
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err: any) {
      setError(err.message || "Erro ao gerar cobrança.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo variant="dark" showRatingBadge={true} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Ativação Segura do NotaLocal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Pagamento processado com segurança bancária pelo Asaas.
        </p>
      </div>

      {/* Seletor de Plano Rápido no Topo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/80">
          <button
            type="button"
            onClick={() => setPlan("annual")}
            className={`relative p-4 rounded-xl text-left transition-all cursor-pointer border ${
              plan === "annual"
                ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-600/10"
                : "bg-slate-900/40 border-transparent hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                Plano Anual
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  40% OFF • Recomendado
                </span>
              </span>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  plan === "annual" ? "border-blue-400 bg-blue-500" : "border-slate-600"
                }`}
              >
                {plan === "annual" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <p className="text-xs text-slate-300 font-semibold">
              12x de <strong className="text-white text-sm">R$ 29,90</strong>{" "}
              <span className="text-slate-400 font-normal">(ou R$ 297 à vista no Pix)</span>
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPlan("monthly")}
            className={`relative p-4 rounded-xl text-left transition-all cursor-pointer border ${
              plan === "monthly"
                ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-600/10"
                : "bg-slate-900/40 border-transparent hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                Plano Mensal
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-semibold">
                  Sem fidelidade
                </span>
              </span>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  plan === "monthly" ? "border-blue-400 bg-blue-500" : "border-slate-600"
                }`}
              >
                {plan === "monthly" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <p className="text-xs text-slate-300 font-semibold">
              <strong className="text-white text-sm">R$ 49,90</strong> / mês{" "}
              <span className="text-slate-400 font-normal">(renovação mensal)</span>
            </p>
          </button>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Coluna 1: Resumo do Pacote / Valor */}
        <div className="md:col-span-5 bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-6">
          <div>
            {plan === "annual" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Mais Escolhido • Economize 40%
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-400/30 mb-3">
                Assinatura Mensal Flexível
              </span>
            )}
            <h3 className="text-xl font-bold text-white">
              {plan === "annual" ? "Plano Anual Blindagem Total" : "Plano Mensal Blindagem Total"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Tudo pronto para multiplicar avaliações 5 estrelas no Google e reter críticas em privado.
            </p>
          </div>

          {plan === "annual" ? (
            <div className="py-4 border-y border-slate-700/80 space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-slate-400">12x de</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white">R$ 29,90</span>
                <span className="text-xs text-slate-400">no cartão</span>
              </div>
              <p className="text-xs text-emerald-400 font-semibold">
                ou <strong>R$ 297,00 à vista no Pix</strong> (menos de R$ 0,99 por dia)
              </p>
            </div>
          ) : (
            <div className="py-4 border-y border-slate-700/80 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">R$ 49,90</span>
                <span className="text-xs text-slate-400">/ mês</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Sem fidelidade • Cancele quando quiser
              </p>
            </div>
          )}

          <div className="space-y-3">
            {[
              "Página exclusiva personalizada com o nome e cores da sua empresa",
              "Painel de Gestão e métricas em tempo real",
              "Filtro inteligente (4-5⭐ Google / 1-3⭐ Ouvidoria Privada)",
              "Notificação por e-mail e roteiros prontos de recuperação no WhatsApp",
              "Gerador de Arte Digital de Balcão & QR Code prontos para impressão",
              "Disparador rápido de convites de avaliação via WhatsApp",
              "Comprovante e fatura formal para contabilidade",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Ambiente seguro com criptografia bancária</span>
          </div>
        </div>

        {/* Coluna 2: Formulário de Checkout */}
        <div className="md:col-span-7 bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Dados de Faturamento</h3>
          <p className="text-xs text-slate-500 mb-6">
            Preencha seus dados para emissão da cobrança e ativação imediata do painel.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome Completo ou Razão Social
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Eduardo Silva"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-mail para Recebimento da Fatura e Acesso
              </label>
              <input
                type="email"
                required
                placeholder="Ex: financeiro@suaempresa.com.br"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CPF ou CNPJ (para a fatura)
                </label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={form.cpfCnpj}
                  onChange={(e) =>
                    setForm({ ...form, cpfCnpj: formatCpfCnpjMask(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Celular / WhatsApp (para avisos)
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: formatPhoneMask(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span>Processando cobrança Asaas...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {plan === "annual"
                        ? "Continuar no Plano Anual (Pix ou Cartão)"
                        : "Continuar no Plano Mensal (Pix ou Cartão)"}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Garantia de 7 dias
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <QrCode className="w-4 h-4 text-blue-500" /> Liberação Imediata
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
