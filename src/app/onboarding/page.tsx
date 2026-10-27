"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  Building2,
  ExternalLink,
  Phone,
  Palette,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "Clínica Odontológica",
    googleReviewUrl: "",
    notificationPhone: "",
    coverColor: "#2563eb",
  });

  // Gerar slug automaticamente ao digitar o nome
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const autoSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === "" || prev.slug === prev.name.toLowerCase() ? autoSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/business/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao configurar empresa.");
      }

      // Redireciona para o painel de gestão da nova empresa
      router.push(`/admin`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo variant="dark" showRatingBadge={false} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Configuração do seu Estabelecimento
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Leva menos de 2 minutos para colocar sua blindagem e QR Code no ar.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome da Empresa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome da sua Empresa ou Clínica
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Florido Odontologia"
                  value={form.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Link Personalizado (Slug) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Endereço Exclusivo da sua Página (Slug)
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                <span className="px-3.5 text-xs text-slate-400 font-mono font-medium select-none">
                  notalocal.com.br/
                </span>
                <input
                  type="text"
                  required
                  placeholder="sua-empresa"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  className="w-full py-3 pr-4 bg-transparent text-sm font-semibold text-slate-900 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Este é o link que vai no QR Code do seu balcão e no WhatsApp dos clientes.
              </p>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ramo de Atuação
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Odontologia Especializada, Oficina Mecânica, Barbearia"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>

            {/* Link Oficial de Review do Google Maps */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Link de Avaliação do Google Maps
                </label>
                <a
                  href="https://support.google.com/business/answer/3474122?hl=pt-BR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Como pegar meu link?</span>
                </a>
              </div>
              <input
                type="url"
                required
                placeholder="https://search.google.com/local/writereview?placeid=... ou g.page/r/..."
                value={form.googleReviewUrl}
                onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Para cá serão direcionados todos os clientes que derem 4 ou 5 estrelas.
              </p>
            </div>

            {/* WhatsApp para Alerta de Crise */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp do Gerente / Responsável (com DDD)
              </label>
              <input
                type="tel"
                placeholder="Ex: 15998383997"
                value={form.notificationPhone}
                onChange={(e) => setForm({ ...form, notificationPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Você receberá um alerta imediato caso algum cliente deixe nota de 1 a 3 estrelas.
              </p>
            </div>

            {/* Cor da Marca */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cor de Destaque da sua Marca
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.coverColor}
                  onChange={(e) => setForm({ ...form, coverColor: e.target.value })}
                  className="w-12 h-10 p-1 rounded-xl border border-slate-200 cursor-pointer bg-white"
                />
                <span className="text-xs text-slate-500 font-mono">{form.coverColor}</span>
              </div>
            </div>

            {/* Botão de Finalização */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {loading ? (
                  <span>Criando seu sistema...</span>
                ) : (
                  <>
                    <span>Ativar Meu NotaLocal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
