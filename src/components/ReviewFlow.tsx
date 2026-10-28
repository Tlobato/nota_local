"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquareWarning, Send, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import type { Business } from "@/lib/db/schema";

interface ReviewFlowProps {
  business: Business;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; emoji: string }> = {
  1: { label: "Muito insatisfeito", emoji: "😞" },
  2: { label: "Poderia ser melhor", emoji: "🙁" },
  3: { label: "Razoável / Regular", emoji: "😐" },
  4: { label: "Muito bom!", emoji: "😊" },
  5: { label: "Excelente! Perfeito!", emoji: "🤩" },
};

export default function ReviewFlow({ business }: ReviewFlowProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [step, setStep] = useState<"rating" | "positive" | "negative_form" | "negative_done">("rating");
  const [loading, setLoading] = useState(false);

  // Form states for negative feedback
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [comment, setComment] = useState("");
  const [countdown, setCountdown] = useState(3);

  const activeRating = hoverRating || selectedRating || 0;

  // Handler for star selection
  const handleSelectStar = async (rating: number) => {
    setSelectedRating(rating);
    if (rating >= 4) {
      // 4 ou 5 estrelas: Redirecionamento para Google
      setStep("positive");
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Salva no banco de dados como avaliação positiva redirecionada
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessSlug: business.slug,
            rating,
          }),
        });
      } catch (e) {
        console.error("Erro ao registrar feedback:", e);
      }
    } else {
      // 1, 2 ou 3 estrelas: Retenção interna
      setStep("negative_form");
    }
  };

  // Redirecionamento automático com contador se for positivo
  useEffect(() => {
    if (step === "positive" && business.googleReviewUrl) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = business.googleReviewUrl;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, business.googleReviewUrl]);

  // Envio do formulário de crítica privada
  const handleSubmitNegative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating) return;

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: business.slug,
          rating: selectedRating,
          customerName,
          customerPhone,
          comment,
        }),
      });

      const data = await res.json();
      setStep("negative_done");

      // Se houver alerta de WhatsApp configurado, notifica
      if (data.whatsappAlertUrl) {
        // Alerta gerado com sucesso
      }
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao enviar seu recado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
      {/* Top Banner com Cor da Empresa */}
      <div
        className="h-28 flex flex-col justify-end p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${business.coverColor || "#2563eb"} 0%, #1e293b 100%)`,
        }}
      >
        <div className="absolute top-3 right-4 flex items-center gap-1.5 text-xs text-white/80 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Canal Oficial de Atendimento</span>
        </div>
        <p className="text-xs uppercase tracking-wider text-white/70 font-semibold mb-0.5">
          {business.category || "Atendimento ao Cliente"}
        </p>
        <h1 className="text-xl font-bold truncate leading-tight">{business.name}</h1>
      </div>

      <div className="p-6">
        {/* ETAPA 1: SELEÇÃO DE ESTRELAS */}
        {step === "rating" && (
          <div className="text-center py-2">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              {business.welcomeMessage || "Como foi sua experiência conosco?"}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Toque nas estrelas para avaliar nosso atendimento:
            </p>

            {/* Container de Estrelas */}
            <div className="flex justify-center items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleSelectStar(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95 duration-150"
                    aria-label={`Avaliar com ${star} estrelas`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors duration-150 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 filter drop-shadow-sm"
                          : "text-slate-200 fill-slate-50"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Descrição Dinâmica da Nota */}
            <div className="h-8 flex items-center justify-center">
              {activeRating > 0 ? (
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 px-3.5 py-1 rounded-full border border-slate-200/80 animate-in fade-in duration-200">
                  <span className="text-base">{RATING_DESCRIPTIONS[activeRating].emoji}</span>
                  <span>{RATING_DESCRIPTIONS[activeRating].label}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Selecione de 1 a 5</span>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Sua opinião é protegida e segura</span>
            </div>
          </div>
        )}

        {/* ETAPA 2A: POSITIVA (4 OU 5 ESTRELAS) - REDIRECIONAMENTO GOOGLE */}
        {step === "positive" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
              {"⭐".repeat(selectedRating || 5)} Experiência Incrível!
            </span>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Muito obrigado pelo carinho!</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Sua avaliação no Google faz uma diferença enorme para nossa equipe e ajuda outras pessoas a encontrarem a{" "}
              <strong className="text-slate-800">{business.name}</strong>.
            </p>

            {/* Botão de Redirecionamento Google */}
            <a
              href={business.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Avaliar no Google</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <p className="text-xs text-slate-400 mt-4">
              Redirecionando automaticamente em <strong>{countdown}s</strong>...
            </p>
          </div>
        )}

        {/* ETAPA 2B: NEGATIVA (1 A 3 ESTRELAS) - FORMULÁRIO DE RETENÇÃO INTERNA */}
        {step === "negative_form" && (
          <div className="py-2">
            <div className="flex items-center gap-2.5 mb-3 bg-amber-50 border border-amber-200/80 p-3 rounded-2xl text-amber-900">
              <MessageSquareWarning className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Sentimos muito por isso!</p>
                <p className="text-xs text-amber-800/90">
                  Queremos ouvir você para corrigir qualquer falha imediatamente.
                </p>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              Como podemos melhorar?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Conte o que aconteceu para que a equipe da {business.name} possa corrigir e evoluir nosso atendimento.
            </p>

            <form onSubmit={handleSubmitNegative} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Seu Nome (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Seu WhatsApp (para retorno e solução)
                </label>
                <input
                  type="tel"
                  placeholder="(15) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                    let masked = digits;
                    if (digits.length > 2 && digits.length <= 6) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                    else if (digits.length > 6 && digits.length <= 10) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
                    else if (digits.length > 10) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                    setCustomerPhone(masked);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Opcional: deixe seu número se desejar uma resposta direta da equipe ou uma compensação pelo ocorrido.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  O que podemos fazer para melhorar? *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Conte com detalhes o que aconteceu em seu atendimento..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <span>Enviando sua mensagem...</span>
                  ) : (
                    <>
                      <span>Enviar Mensagem</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep("rating")}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors pt-1 cursor-pointer"
              >
                Voltar e alterar nota
              </button>
            </form>
          </div>
        )}

        {/* ETAPA 2C: AGRADECIMENTO CRÍTICA RETIDA */}
        {step === "negative_done" && (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Mensagem recebida com sucesso!</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Agradecemos sinceramente pela sua sinceridade. Seu relato foi registrado diretamente no canal de atendimento da{" "}
              <strong>{business.name}</strong> para que possamos corrigir falhas e melhorar continuamente nossos serviços.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-500">
              Valorizamos cada cliente e trabalhamos constantemente para oferecer o melhor atendimento possível.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
