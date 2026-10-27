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
  Tag,
  Gift,
} from "lucide-react";

const VALID_COUPONS = ["THYAGO100", "CORTESIA", "TESTE100", "VIP100", "PRESENTE"];

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    phone: "",
    coupon: "",
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();

    if (!code) return;

    if (VALID_COUPONS.includes(code)) {
      setAppliedCoupon(code);
      setForm((prev) => ({ ...prev, coupon: code }));
    } else {
      setCouponError("Cupom inválido ou expirado.");
    }
  };

  const isFree = Boolean(appliedCoupon);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          coupon: appliedCoupon || form.coupon,
        }),
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
          {isFree ? "Ativação de Cortesia NotaLocal" : "Ativação Segura do NotaLocal"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          {isFree
            ? "Licença cortesia aplicada com 100% de desconto."
            : "Pagamento processado com segurança bancária pelo Asaas."}
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

          <div className="py-4 border-y border-slate-700/80 space-y-2">
            {isFree ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-purple-400">GRÁTIS</span>
                  <span className="text-xs line-through text-slate-500">R$ 490</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold mt-1">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span>Cupom {appliedCoupon} aplicado (100% OFF)</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">R$ 490</span>
                  <span className="text-xs text-slate-400">à vista no Pix</span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold">
                  ou em até <strong>12x de R$ 48,90</strong> no cartão de crédito
                </p>
              </>
            )}
          </div>

          {/* Campo de Cupom */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" /> Possui cupom de cortesia ou desconto?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: CORTESIA ou THYAGO100"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Aplicar
              </button>
            </div>
            {couponError && <p className="text-xs text-red-400 mt-1">{couponError}</p>}
            {isFree && (
              <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Cupom ativado! Nenhum valor será cobrado.
              </p>
            )}
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
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {isFree ? "Dados para Ativação da Licença" : "Dados de Faturamento"}
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            {isFree
              ? "Preencha seus dados para vincular seu painel gratuito."
              : "Preencha seus dados para emissão da cobrança e ativação do painel."}
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
                E-mail para Acesso ao Painel
              </label>
              <input
                type="email"
                required
                placeholder="Ex: contato@suaempresa.com.br"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CPF ou CNPJ {isFree && "(Opcional)"}
                </label>
                <input
                  type="text"
                  required={!isFree}
                  placeholder="000.000.000-00"
                  value={form.cpfCnpj}
                  onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Celular / WhatsApp (Opcional)
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
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
                className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 ${
                  isFree
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30"
                }`}
              >
                {loading ? (
                  <span>Processando ativação...</span>
                ) : isFree ? (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>Ativar Licença Cortesia Gratuita</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Continuar para Pagamento Asaas (Pix ou Cartão)</span>
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
