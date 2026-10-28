"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import {
  Star,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  QrCode,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Zap,
  Building,
  HeartHandshake,
  MessageSquareWarning,
  Send,
} from "lucide-react";
import confetti from "canvas-confetti";

import Logo from "@/components/Logo";

const SIMULATOR_RATINGS: Record<number, { label: string; emoji: string }> = {
  1: { label: "Muito insatisfeito", emoji: "😞" },
  2: { label: "Poderia ser melhor", emoji: "🙁" },
  3: { label: "Razoável / Regular", emoji: "😐" },
  4: { label: "Muito bom!", emoji: "😊" },
  5: { label: "Excelente! Perfeito!", emoji: "🤩" },
};

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const [demoRating, setDemoRating] = useState<number | null>(null);
  const [demoStep, setDemoStep] = useState<
    "choose" | "positive" | "negative_form" | "negative_done"
  >("choose");
  const [demoName, setDemoName] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [demoComment, setDemoComment] = useState("");

  const activeStar = hoverStar || demoRating || 0;

  const handleTestStar = (star: number) => {
    setDemoRating(star);
    if (star >= 4) {
      setDemoStep("positive");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } else {
      setDemoStep("negative_form");
    }
  };

  const resetDemo = () => {
    setDemoRating(null);
    setHoverStar(null);
    setDemoName("");
    setDemoPhone("");
    setDemoComment("");
    setDemoStep("choose");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo variant="dark" showRatingBadge={true} />

          <div className="flex items-center gap-3">
            <Link
              href="/clinica-sorriso"
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Ver Demo
            </Link>

            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  <span>Acessar Meu Painel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="ml-1 flex items-center">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/admin"
                  className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/checkout"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all"
                >
                  Ativar Meu Negócio
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-900 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-sm">
            <span className="text-amber-400 text-sm">⭐</span>
            <span>A plataforma de reputação definitiva para o seu negócio local</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Proteja sua nota no Google e{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              multiplique avaliações 5 estrelas.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            O filtro inteligente que direciona clientes satisfeitos direto para o seu perfil no Google e retém críticas internamente antes que virem queixas públicas.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/admin"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Ir para o Meu Painel do Gestor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#simulador"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>Testar Simulador</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href="#simulador"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Testar Simulador na Prática</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#planos"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Ver Planos e Preços</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Simulador Interativo */}
      <section id="simulador" className="py-16 px-4 sm:px-6 bg-slate-950/60 border-y border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Experiência Real
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Faça o teste agora mesmo
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Clique em uma nota abaixo e veja como o NotaLocal se comporta com clientes satisfeitos vs insatisfeitos:
            </p>
          </div>

          {/* Container do Simulador (Idêntico à experiência real do cliente) */}
          <div className="w-full max-w-md mx-auto bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Banner Superior da Empresa Simulada */}
            <div
              className="h-24 flex flex-col justify-end p-5 text-white relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1e293b 100%)",
              }}
            >
              <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[11px] text-white/90 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Canal Oficial de Atendimento</span>
              </div>
              <p className="text-[11px] uppercase tracking-wider text-white/75 font-semibold">
                Simulação Interativa
              </p>
              <h3 className="text-lg font-bold truncate leading-tight">
                Sua Empresa / Clínica Aqui
              </h3>
            </div>

            <div className="p-6">
              {demoStep === "choose" && (
                <div className="py-2 text-center">
                  <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5">
                    Como foi sua experiência conosco hoje?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mb-5">
                    Toque nas estrelas abaixo para testar os dois caminhos:
                  </p>

                  <div className="flex justify-center items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= activeStar;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverStar(star)}
                          onMouseLeave={() => setHoverStar(null)}
                          onClick={() => handleTestStar(star)}
                          className="p-1.5 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-10 h-10 transition-colors ${
                              isFilled
                                ? "fill-amber-400 text-amber-400 filter drop-shadow-sm"
                                : "fill-amber-400/20 text-amber-400/60"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-8 flex items-center justify-center">
                    {activeStar > 0 ? (
                      <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 px-3.5 py-1 rounded-full border border-slate-200/80">
                        <span>{SIMULATOR_RATINGS[activeStar].emoji}</span>
                        <span>{SIMULATOR_RATINGS[activeStar].label}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Experimente clicar em <strong>5 estrelas</strong> ou em{" "}
                        <strong>2 estrelas</strong>.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {demoStep === "positive" && (
                <div className="py-2 text-center space-y-3 animate-in fade-in">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cenário {demoRating} Estrelas: Cliente direcionado ao Google!</span>
                  </div>

                  <div className="pt-2">
                    <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                      {"⭐".repeat(demoRating || 5)} Experiência Incrível!
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      Muito obrigado pelo carinho!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Como o cliente deu nota alta, o sistema agradece e já abre automaticamente a caixa de avaliação oficial da sua empresa no Google!
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md">
                      <span>Abrindo Avaliação no Google...</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetDemo}
                    className="pt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer block mx-auto"
                  >
                    ← Voltar e testar nota baixa (1 a 3 estrelas)
                  </button>
                </div>
              )}

              {demoStep === "negative_form" && (
                <div className="py-1 animate-in fade-in space-y-3">
                  {/* Explicação do que está acontecendo para o dono do negócio */}
                  <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-xl text-[11px] leading-snug flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Veja o filtro em ação ({demoRating}⭐):</strong> Em vez de mandar o cliente irritado para o Google, abrimos na hora esta Ouvidoria Privada para ele desabafar direto com você:
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200/80 p-3 rounded-2xl text-amber-900">
                    <MessageSquareWarning className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">Sentimos muito por isso!</p>
                      <p className="text-[11px] text-amber-800/90">
                        Queremos ouvir você para corrigir qualquer falha imediatamente.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Como podemos melhorar?
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Conte o que aconteceu para que a nossa equipe possa corrigir e evoluir nosso atendimento.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setDemoStep("negative_done");
                    }}
                    className="space-y-2.5 text-left"
                  >
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Seu Nome (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: João da Silva"
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Seu WhatsApp (para retorno e solução)
                      </label>
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={demoPhone}
                        onChange={(e) => setDemoPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Opcional: deixe seu número se desejar uma resposta direta da equipe.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        O que podemos fazer para melhorar? *
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Conte com detalhes o que aconteceu em seu atendimento..."
                        value={demoComment}
                        onChange={(e) => setDemoComment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <span>Enviar Mensagem</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={resetDemo}
                      className="w-full text-center text-xs text-blue-600 font-semibold hover:underline pt-1 cursor-pointer"
                    >
                      ← Voltar e testar outra nota
                    </button>
                  </form>
                </div>
              )}

              {demoStep === "negative_done" && (
                <div className="py-4 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Mensagem recebida com sucesso!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pronto! O relato foi registrado diretamente no canal de atendimento da empresa (sem publicar no Google) e você recebe o alerta no painel e por e-mail para chamá-lo no WhatsApp e reverter a situação!
                  </p>
                  <button
                    type="button"
                    onClick={resetDemo}
                    className="mt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    ← Testar novamente do início
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Por que isso é vital para o comércio? */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              A matemática implacável do Google
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
              Empresas locais perdem centenas de milhares de reais em faturamento simplesmente por não controlarem a reputação online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Efeito 10 para 1</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Para cada avaliação de 1 estrela que você recebe, são necessárias até <strong>10 avaliações de 5 estrelas</strong> apenas para recuperar a média anterior.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ranqueamento Local</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                O algoritmo do Google prioriza estabelecimentos com alto volume de avaliações recentes. Quem tem mais reviews aparece no topo das buscas sem pagar anúncios.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resolução de Crises</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                92% dos clientes que tiveram um problema voltam a comprar se forem ouvidos e tiverem sua queixa resolvida com rapidez pela equipe da empresa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Planos (Ancoragem Mensal vs Anual) */}
      {!(isLoaded && isSignedIn) && (
        <section id="planos" className="py-20 px-4 sm:px-6 bg-slate-950/80 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Menos de R$ 0,99 por dia
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Quanto vale impedir 1 crítica injusta no seu Google?
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
                Um único cliente salvo ou uma única venda nova vinda do Google já paga um ano inteiro de assinatura. Escolha o plano ideal para o seu negócio:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* Plano Mensal */}
              <div className="bg-slate-900/90 p-7 sm:p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold mb-3">
                      Sem Fidelidade
                    </span>
                    <h3 className="text-xl font-bold text-white">Plano Mensal</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Ideal para quem deseja testar mês a mês sem compromisso anual.
                    </p>
                  </div>

                  <div className="py-4 border-y border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">R$ 49,90</span>
                      <span className="text-xs text-slate-400">/ mês</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Cobrança mensal via Pix ou Cartão • Cancele quando quiser
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      "Página exclusiva personalizada com o nome e cores da sua empresa",
                      "Filtro inteligente (4-5⭐ vão para o Google / 1-3⭐ ficam na Ouvidoria)",
                      "Ouvidoria Privada com alerta por e-mail e roteiros de resposta no WhatsApp",
                      "Gerador de Arte Digital de Balcão & QR Code prontos para impressão",
                      "Disparador rápido de convites de avaliação via WhatsApp",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    href="/checkout?plan=monthly"
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Começar no Plano Mensal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Plano Anual (Destaque) */}
              <div className="relative bg-gradient-to-b from-blue-950/80 via-slate-900 to-slate-900 p-7 sm:p-8 rounded-3xl border-2 border-blue-500 shadow-2xl shadow-blue-600/20 flex flex-col justify-between">
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                  Mais Escolhido • 40% OFF
                </div>

                <div className="space-y-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-3">
                      Blindagem Anual Completa
                    </span>
                    <h3 className="text-xl font-bold text-white">Plano Anual</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Todos os recursos liberados com 40% de economia e 1 ano inteiro sem preocupação com mensalidades.
                    </p>
                  </div>

                  <div className="py-4 border-y border-slate-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-blue-300">12x de</span>
                      <span className="text-4xl sm:text-5xl font-extrabold text-white">R$ 29,90</span>
                      <span className="text-xs text-slate-400">no cartão</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold mt-1.5">
                      ou <strong>R$ 297,00 à vista no Pix</strong> (equivale a R$ 0,99 por dia)
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      "Todos os recursos do Plano Mensal 100% liberados",
                      "Economia imediata de 40% (você economiza R$ 240 no ano)",
                      "12 meses completos de acesso sem se preocupar com faturas mensais",
                      "Arte Digital de Balcão em alta definição (300 DPI) + QR Code exclusivo",
                      "Garantia incondicional de 7 dias ou seu dinheiro de volta",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    href="/checkout?plan=annual"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Começar no Plano Anual</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-slate-950 text-center border-t border-slate-800">
        <div className="max-w-2xl mx-auto space-y-6">
          {isLoaded && isSignedIn ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sua conta está ativa no NotaLocal</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                Seu estabelecimento já está protegido!
              </h2>
              <p className="text-sm text-slate-400">
                Acesse seu painel a qualquer momento para acompanhar as avaliações recebidas, baixar novas plaquinhas de balcão e gerenciar suas métricas.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/admin"
                  className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <span>Acessar Meu Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/clinica-sorriso"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
                >
                  Ver Demo ao Vivo
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-white">
                Pronto para blindar a nota do seu negócio?
              </h2>
              <p className="text-sm text-slate-400">
                Comece a multiplicar avaliações 5 estrelas hoje mesmo por menos de R$ 0,99 por dia (12x de R$ 29,90 no plano anual ou R$ 49,90/mês sem fidelidade).
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  href="/checkout?plan=annual"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25"
                >
                  Ativar Meu Estabelecimento
                </Link>
                <Link
                  href="/clinica-sorriso"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
                >
                  Ver Demo ao Vivo
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NotaLocal. Todos os direitos reservados.</p>
          <p className="text-slate-400">
            Feito para impulsionar negócios locais em todo o Brasil.
          </p>
        </div>
      </footer>
    </div>
  );
}
