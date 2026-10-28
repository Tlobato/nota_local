"use client";

import React, { useState } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";
import {
  Building2,
  Users,
  DollarSign,
  Star,
  Plus,
  Search,
  Check,
  ExternalLink,
  Eye,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Mail,
  Phone,
  X,
  Gift,
  ShieldAlert,
} from "lucide-react";

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  ownerEmail: string | null;
  googleReviewUrl: string;
  notificationPhone: string | null;
  paymentStatus: string | null;
  isDemo: boolean | null;
  feedbackCount: number;
  createdAt: Date;
}

interface SuperAdminDashboardProps {
  businesses: BusinessItem[];
  stats: {
    totalBusinesses: number;
    activeClients: number;
    totalFeedbacks: number;
    estimatedRevenue: number;
  };
  adminEmail?: string;
}

export default function SuperAdminDashboard({
  businesses: initialBusinesses,
  stats: initialStats,
  adminEmail,
}: SuperAdminDashboardProps) {
  const [businessesList, setBusinessesList] = useState<BusinessItem[]>(initialBusinesses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal de cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de mensagem de WhatsApp gerada
  const [welcomeModalData, setWelcomeModalData] = useState<{
    name: string;
    slug: string;
    email: string;
    isGift: boolean;
    messageText: string;
  } | null>(null);

  const [copiedText, setCopiedText] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "Clínica Odontológica",
    ownerEmail: "",
    googleReviewUrl: "",
    notificationPhone: "",
    paymentStatus: "active",
    coverColor: "#2563eb",
  });

  // Categorias predefinidas completas
  const CATEGORY_OPTIONS = [
    "Clínica Odontológica / Dentista",
    "Clínica Médica / Consultório",
    "Estética / Harmonização / Dermatologia",
    "Confeitaria / Doceria / Padaria",
    "Restaurante / Hamburgueria / Pizzaria",
    "Bar / Cafeteria / Bistrô",
    "Barbearia / Salão de Beleza",
    "Design / Gráfica / Comunicação Visual",
    "Pet Shop / Clínica Veterinária",
    "Academia / Studio / Crossfit",
    "Oficina Mecânica / Auto Center",
    "Escritório de Advocacia",
    "Contabilidade / Consultoria",
    "Imobiliária / Corretor",
    "Hotel / Pousada",
    "Outro (Personalizado)",
  ];

  const [customCategory, setCustomCategory] = useState("");

  // Máscara dinâmica de telefone brasileiro (DDD) XXXXX-XXXX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = formatPhone(e.target.value);
    setForm((prev) => ({ ...prev, notificationPhone: masked }));
  };

  // Verificação de link do Google
  const isGoogleLink = (url: string) => {
    if (!url) return null;
    const clean = url.trim().toLowerCase();
    return clean.includes("google") || clean.includes("goo.gl");
  };

  // Atualizar slug automaticamente com o nome
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

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const finalCategory =
        form.category === "Outro (Personalizado)" ? customCategory.trim() || "Negócio Local" : form.category;

      const res = await fetch("/api/super-admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: finalCategory,
          notificationPhone: form.notificationPhone.replace(/\D/g, ""),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar empresa.");
      }

      // Adicionar à lista local
      const newBusiness: BusinessItem = {
        ...data.business,
        feedbackCount: 0,
        createdAt: new Date(),
      };

      setBusinessesList((prev) => [newBusiness, ...prev]);
      setIsModalOpen(false);

      // Gerar texto do WhatsApp de onboarding
      const appUrl = window.location.origin;
      const reviewUrl = `${appUrl}/${newBusiness.slug}`;
      const adminUrl = `${appUrl}/admin`;

      const isGift = form.paymentStatus === "gift";

      const welcomeMessage = isGift
        ? `Olá! Tudo bem? 🎁

Você ganhou acesso exclusivo à plataforma *NotaLocal* para blindagem de avaliações no Google para a *${newBusiness.name}*! 🛡️⭐

📍 *Link de Avaliação dos seus clientes:*
${reviewUrl}

🔑 *Seu Painel de Controle e QR Codes:*
${adminUrl}

*Como acessar seu painel:*
1. Clique no link do painel acima;
2. Faça login usando este seu e-mail: *${newBusiness.ownerEmail}* (basta clicar em "Continuar com o Google" ou solicitar o código de acesso por e-mail).

Já deixei os seus QR Codes gerados e a blindagem ativada com licença cortesia 100% liberada. Qualquer dúvida estou por aqui!`
        : `Olá! Tudo bem? 

Sua plataforma *NotaLocal* para blindagem de avaliações no Google já está 100% pronta e ativa para a *${newBusiness.name}*! 🛡️⭐

📍 *Link de Avaliação dos seus clientes:*
${reviewUrl}

🔑 *Seu Painel de Controle e QR Codes:*
${adminUrl}

*Como acessar seu painel:*
1. Clique no link do painel acima;
2. Faça login usando este seu e-mail: *${newBusiness.ownerEmail}* (basta clicar em "Continuar com o Google" ou solicitar o código de acesso por e-mail).

Já deixei os seus QR Codes gerados e a blindagem ativada. Qualquer dúvida estou por aqui!`;

      setWelcomeModalData({
        name: newBusiness.name,
        slug: newBusiness.slug,
        email: newBusiness.ownerEmail || "",
        isGift,
        messageText: welcomeMessage,
      });

      // Reset form
      setForm({
        name: "",
        slug: "",
        category: "Clínica Odontológica",
        ownerEmail: "",
        googleReviewUrl: "",
        notificationPhone: "",
        paymentStatus: "active",
        coverColor: "#2563eb",
      });
    } catch (err: any) {
      setFormError(err.message || "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string | null) => {
    // Alternar ciclo: active -> gift -> pending -> active
    let nextStatus = "active";
    if (currentStatus === "active") nextStatus = "gift";
    else if (currentStatus === "gift") nextStatus = "pending";
    else nextStatus = "active";

    try {
      const res = await fetch("/api/super-admin/businesses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentStatus: nextStatus }),
      });

      if (res.ok) {
        setBusinessesList((prev) =>
          prev.map((b) => (b.id === id ? { ...b, paymentStatus: nextStatus } : b))
        );
      }
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const filteredBusinesses = businessesList.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.ownerEmail && b.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && b.paymentStatus === "active";
    if (filterStatus === "gift") return matchesSearch && b.paymentStatus === "gift";
    if (filterStatus === "pending") return matchesSearch && b.paymentStatus === "pending";
    if (filterStatus === "demo") return matchesSearch && b.isDemo;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Topbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="h-5 w-[1px] bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                Master Admin
              </span>
              {adminEmail && (
                <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                  {adminEmail}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/clinica-sorriso"
              target="_blank"
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Ver Demonstração
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Empresas no Sistema</span>
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{businessesList.length}</div>
            <p className="text-xs text-slate-400 mt-1">Total de estabelecimentos</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Clientes Ativos</span>
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {
                businessesList.filter(
                  (b) => (b.paymentStatus === "active" || b.paymentStatus === "gift") && !b.isDemo
                ).length
              }
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {businessesList.filter((b) => b.paymentStatus === "gift").length} cortesias /{" "}
              {businessesList.filter((b) => b.paymentStatus === "active" && !b.isDemo).length} pagantes
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Avaliações Filtradas</span>
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {businessesList.reduce((acc, curr) => acc + curr.feedbackCount, 0)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Proteções e direcionamentos ao Google</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Faturamento Asaas (Est.)</span>
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-purple-400">
              R${" "}
              {(
                businessesList.filter((b) => b.paymentStatus === "active" && !b.isDemo).length * 490
              ).toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-slate-400 mt-1">Base de cálculo R$ 490 por pagante</p>
          </div>
        </div>

        {/* Section Clientes */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 backdrop-blur">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, slug ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "Todos" },
                { id: "active", label: "Pagantes" },
                { id: "gift", label: "Cortesias 🎁" },
                { id: "pending", label: "Pendentes" },
                { id: "demo", label: "Demonstração" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilterStatus(id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    filterStatus === id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-700/80 bg-slate-900/40">
                <tr>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">E-mail de Acesso</th>
                  <th className="py-3 px-4">WhatsApp Gerente</th>
                  <th className="py-3 px-4 text-center">Avaliações</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredBusinesses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                          {b.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {b.name}
                            {b.isDemo && (
                              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                DEMO
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">/{b.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-300 font-mono text-xs">
                      {b.ownerEmail ? (
                        <span className="flex items-center gap-1.5 text-slate-200">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {b.ownerEmail}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Não vinculado</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-300 text-xs">
                      {b.notificationPhone ? (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {b.notificationPhone}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">-</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400 text-xs bg-amber-400/10 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {b.feedbackCount}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(b.id, b.paymentStatus)}
                        title="Clique para alternar (Ativo -> Cortesia -> Pendente)"
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
                          b.paymentStatus === "gift"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
                            : b.paymentStatus === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                        }`}
                      >
                        {b.paymentStatus === "gift"
                          ? "🎁 Cortesia"
                          : b.paymentStatus === "active"
                          ? "Ativo"
                          : "Pendente"}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver página pública */}
                        <Link
                          href={`/${b.slug}`}
                          target="_blank"
                          title="Abrir página pública de avaliação"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Acessar painel do cliente */}
                        <Link
                          href={`/admin?businessId=${b.id}`}
                          title="Acessar painel deste cliente"
                          className="px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/20 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Painel
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhum estabelecimento encontrado com os filtros selecionados.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Cadastro de Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cadastrar Novo Cliente</h3>
                <p className="text-xs text-slate-400">
                  Configure a blindagem e vincule ao e-mail de acesso do cliente
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Empresa / Clínica *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clínica Sorriso Perfeito"
                  value={form.name}
                  onChange={handleNameChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Endereço Curto (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="sorriso-perfeito"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria do Negócio
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.category === "Outro (Personalizado)" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Especifique a Categoria / Nicho *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Comunicação Visual, Confeitaria Gourmet..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-blue-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail do Dono / Gerente (Login) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="marcos@clinica.com (ou Gmail dele)"
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  O cliente só precisará entrar usando este e-mail no Google ou via código de 6 dígitos.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Link de Avaliação do Google Meu Negócio *
                  </label>
                  {form.googleReviewUrl && (
                    <a
                      href={form.googleReviewUrl.startsWith("http") ? form.googleReviewUrl : `https://${form.googleReviewUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Testar Link ↗
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://g.page/r/... ou https://search.google.com/local/writereview..."
                  value={form.googleReviewUrl}
                  onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
                  className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                    form.googleReviewUrl && !isGoogleLink(form.googleReviewUrl)
                      ? "border-amber-500/60 focus:border-amber-500"
                      : "border-slate-700 focus:border-blue-500"
                  }`}
                />
                {form.googleReviewUrl && !isGoogleLink(form.googleReviewUrl) ? (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    Atenção: este link não parece ser do Google. Use o botão &quot;Testar Link&quot; para confirmar.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Para onde os clientes que derem 4 ou 5 estrelas serão direcionados automaticamente.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp do Responsável (Opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 98888-8888"
                    value={form.notificationPhone}
                    onChange={handlePhoneChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Receberá avisos se um cliente relatar insatisfação interna.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Conta / Pagamento
                  </label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Ativo (Pagante R$ 490)</option>
                    <option value="gift">🎁 Cortesia / Amigo / Teste Grátis</option>
                    <option value="pending">Pendente (Aguardando Pagamento)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cor da Marca do Cliente (Cabeçalho da Avaliação)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {["#2563eb", "#0d9488", "#e11d48", "#d97706", "#ea580c", "#7c3aed", "#0f172a"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, coverColor: c })}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          form.coverColor === c ? "border-white scale-110 shadow-sm" : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={form.coverColor}
                    onChange={(e) => setForm({ ...form, coverColor: e.target.value })}
                    className="w-7 h-7 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-0.5"
                    title="Outra cor personalizada"
                  />
                  <span className="text-xs font-mono text-slate-400">
                    {form.coverColor}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Cadastrando..." : "Concluir Cadastro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sucesso com Mensagem Pronta de WhatsApp */}
      {welcomeModalData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setWelcomeModalData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  welcomeModalData.isGift
                    ? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
                    : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                }`}
              >
                {welcomeModalData.isGift ? <Gift className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {welcomeModalData.isGift ? "Licença Cortesia Criada!" : "Cliente Cadastrado com Sucesso!"}
                </h3>
                <p className="text-xs text-slate-400">{welcomeModalData.name} já está no ar</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Copie a mensagem abaixo e envie diretamente no WhatsApp do cliente/amigo. Ele não precisa de senha manual!
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto mb-4 select-all">
              {welcomeModalData.messageText}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => copyToClipboard(welcomeModalData.messageText)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  copiedText
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25"
                }`}
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4" /> Mensagem Copiada!
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" /> Copiar Mensagem para WhatsApp
                  </>
                )}
              </button>

              <button
                onClick={() => setWelcomeModalData(null)}
                className="py-3 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
