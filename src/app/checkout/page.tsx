"use client";

import React, { useState } from "react";
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

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    phone: "",
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Coluna 1: Resumo do Pacote / Valor */}
        <div className="md:col-span-5 bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-xl space-y-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-400/30 mb-3">
              Licença Vitalícia + Setup
            </span>
            <h3 className="text-xl font-bold text-white">Plano Blindagem Total</h3>
            <p className="text-xs text-slate-400 mt-1">
              Tudo pronto para multiplicar avaliações 5 estrelas e reter críticas.
            </p>
          </div>

          <div className="py-4 border-y border-slate-700/80 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">R$ 490</span>
              <span className="text-xs text-slate-400">à vista no Pix</span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold">
              ou em até <strong>12x de R$ 48,90</strong> no cartão de crédito
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Página exclusiva com o logo e cores da sua empresa",
              "Painel de Gestão em tempo real",
              "Filtro inteligente (4-5⭐ Google / 1-3⭐ Ouvidoria)",
              "Alerta instantâneo no WhatsApp do responsável",
              "Gerador de QR Code de balcão em alta resolução",
              "Disparador de 1-clique para WhatsApp da recepção",
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
            Preencha seus dados para emissão da cobrança e ativação do painel.
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
                  onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp com DDD
                </label>
                <input
                  type="tel"
                  placeholder="(15) 99999-9999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {loading ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <span>Ir para Pagamento Seguro</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-400">
                Ao clicar, você poderá escolher entre <strong>Pix Instantâneo</strong>, <strong>Cartão em até 12x</strong> ou <strong>Boleto</strong>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
