"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import confetti from "canvas-confetti";

import Logo from "@/components/Logo";

export default function LandingPage() {
  const [demoRating, setDemoRating] = useState<number | null>(null);
  const [demoStep, setDemoStep] = useState<"choose" | "positive" | "negative">("choose");

  const handleTestStar = (star: number) => {
    setDemoRating(star);
    if (star >= 4) {
      setDemoStep("positive");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } else {
      setDemoStep("negative");
    }
  };

  const resetDemo = () => {
    setDemoRating(null);
    setDemoStep("choose");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo variant="dark" showRatingBadge={true} />

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Acessar Painel
            </Link>
            <Link
              href="/clinica-sorriso"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition-all"
            >
              Ver Demo ao Vivo
            </Link>
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
            Proteja sua nota no Google Maps e{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              multiplique avaliações 5 estrelas.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            O filtro inteligente que direciona clientes satisfeitos direto para o seu Google Meu Negócio e retém críticas internamente antes que virem queixas públicas.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#simulador"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Testar Simulador na Prática</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/admin"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span>Ver Painel de Gestão</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </Link>
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

          {/* Container do Simulador */}
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-2xl border border-slate-100">
            <div className="text-center pb-4 border-b border-slate-100">
              <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">
                Simulação: Clínica Exemplo
              </span>
              <h3 className="text-lg font-bold mt-1 text-slate-800">
                Como foi sua experiência conosco hoje?
              </h3>
            </div>

            {demoStep === "choose" && (
              <div className="py-6 text-center space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleTestStar(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star className="w-10 h-10 fill-amber-400 text-amber-400 filter drop-shadow-sm" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Experimente clicar em <strong>5 estrelas</strong> ou em <strong>2 estrelas</strong>.
                </p>
              </div>
            )}

            {demoStep === "positive" && (
              <div className="py-4 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-emerald-700">
                  {demoRating} Estrelas: Direcionado ao Google Maps!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  O cliente feliz recebe os parabéns e é redirecionado em 2 segundos para o link oficial de review da sua empresa no Google, aumentando suas 5 estrelas públicas!
                </p>
                <button
                  onClick={resetDemo}
                  className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                >
                  Testar outra nota
                </button>
              </div>
            )}

            {demoStep === "negative" && (
              <div className="py-4 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-amber-700">
                  {demoRating} Estrelas: Bloqueado do Google!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A queixa não vai a público! O sistema abre um formulário interno privado e envia um alerta direto no WhatsApp do dono da empresa para resolver a crise.
                </p>
                <button
                  onClick={resetDemo}
                  className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                >
                  Testar outra nota
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Por que isso é vital para o comércio? */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              A matemática implacável do Google Maps
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
                O algoritmo do Google Maps prioriza estabelecimentos com alto volume de avaliações recentes. Quem tem mais reviews aparece no topo das buscas sem pagar anúncios.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resolução de Crises</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                92% dos clientes que tiveram um problema voltam a comprar se forem ouvidos e tiverem sua queixa resolvida com rapidez pela gerência.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-slate-950 text-center border-t border-slate-800">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-white">
            Pronto para ver na prática com a sua empresa?
          </h2>
          <p className="text-sm text-slate-400">
            Acesse a página de demonstração modelo ou explore o painel administrativo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/clinica-sorriso"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
            >
              Testar Página Modelo (Clínica Sorriso)
            </Link>
            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
            >
              Acessar Painel do Gestor
            </Link>
          </div>
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
