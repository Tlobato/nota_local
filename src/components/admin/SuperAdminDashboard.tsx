"use client";

import React, { useState } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";
import type { Prospect } from "@/lib/db/schema";
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
  Target,
  Calendar,
  MapPin,
  UserCheck,
  Edit3,
  Trash2,
  Clock,
  Globe,
  ArrowRight,
  FileText,
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
  initialProspects?: Prospect[];
  stats: {
    totalBusinesses: number;
    activeClients: number;
    totalFeedbacks: number;
    estimatedRevenue: number;
  };
  adminEmail?: string;
}

const PROSPECT_STATUSES = [
  {
    id: "mapped",
    label: "🔍 Mapeado",
    shortLabel: "Mapeado",
    badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
  },
  {
    id: "contacted",
    label: "💬 1º Contato Feito",
    shortLabel: "1º Contato",
    badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    id: "demo_sent",
    label: "🎥 Vídeo / Demo Enviada",
    shortLabel: "Demo Enviada",
    badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
  {
    id: "meeting",
    label: "📅 Reunião / Visita",
    shortLabel: "Reunião",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  {
    id: "followup",
    label: "⏳ Em Follow-up / Negociação",
    shortLabel: "Follow-up",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    id: "won",
    label: "✅ Fechado (Cliente)",
    shortLabel: "Fechado",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "lost",
    label: "❄️ Não quis agora (Retornar depois)",
    shortLabel: "Não quis agora",
    badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
];

const CHANNEL_OPTIONS = [
  { id: "whatsapp", label: "💬 WhatsApp" },
  { id: "instagram", label: "📸 Instagram" },
  { id: "call", label: "📞 Ligação" },
  { id: "visit", label: "🏪 Visita Presencial" },
];

export default function SuperAdminDashboard({
  businesses: initialBusinesses,
  initialProspects = [],
  stats: initialStats,
  adminEmail,
}: SuperAdminDashboardProps) {
  // Aba principal do Super Admin: "clients" (Empresas Ativas) ou "crm" (Prospecção Comercial)
  const [activeSuperTab, setActiveSuperTab] = useState<"clients" | "crm">("clients");

  const [businessesList, setBusinessesList] = useState<BusinessItem[]>(initialBusinesses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Estados do CRM de Prospecção
  const [prospectsList, setProspectsList] = useState<Prospect[]>(initialProspects);
  const [crmSearch, setCrmSearch] = useState("");
  const [crmStatusFilter, setCrmStatusFilter] = useState<string>("all");
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [savingProspect, setSavingProspect] = useState(false);
  const [prospectError, setProspectError] = useState<string | null>(null);
  const [showPitchPlaybook, setShowPitchPlaybook] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const OFFICIAL_PITCH_TEXT = `Olá, tudo bem?

Eu desenvolvi uma aplicação simples focada em ajudar empresas e clínicas a cuidarem melhor das avaliações no Google.

A ideia é bem prática: quando você envia o link (ou o cliente lê o QR Code na recepção), o sistema faz uma triagem rápida. Se o cliente der 4 ou 5 estrelas, ele é direcionado direto para publicar o elogio no Google. Mas se ele der de 1 a 3 estrelas, em vez de ir pro Google, abre na hora uma ouvidoria privada direto com você — assim a pessoa já desabafa ali mesmo e você consegue contornar a situação antes de virar uma crítica pública.

Deixei um simulador rápido no site onde dá para testar os dois cenários em 20 segundos: https://notalocal.vercel.app/#simulador

Se achar que faz sentido para vocês, podemos conversar rapidamente sobre como funciona. Também sou daqui de Sorocaba, qualquer dúvida estou por aqui!`;

  const [prospectForm, setProspectForm] = useState({
    businessName: "",
    category: "Clínica Odontológica / Dentista",
    city: "",
    contactName: "",
    phone: "",
    email: "",
    instagramOrSite: "",
    googleUrl: "",
    googleRating: "",
    googleReviewsCount: "",
    status: "mapped",
    channel: "whatsapp",
    notes: "",
    nextFollowUpDate: "",
  });

  // Modal de cadastro de cliente ativo
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

  // Form State (Novo Cliente)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "Clínica Odontológica / Dentista",
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
    const digits = value.replace(/\D/g, "");
    const localDigits = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
    const raw = localDigits.slice(0, 11);
    if (!raw) return "";
    if (raw.length <= 2) return `(${raw}`;
    if (raw.length <= 6) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    if (raw.length <= 10) return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
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

  const makeSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Atualizar slug automaticamente com o nome
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const autoSlug = makeSlug(name);

    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === "" || prev.slug === makeSlug(prev.name) ? autoSlug : prev.slug,
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

      const newBusiness: BusinessItem = {
        ...data.business,
        feedbackCount: 0,
        createdAt: new Date(),
      };

      setBusinessesList((prev) => [newBusiness, ...prev]);
      setIsModalOpen(false);

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

      setForm({
        name: "",
        slug: "",
        category: "Clínica Odontológica / Dentista",
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

  // ================= FUNÇÕES DO CRM DE PROSPECÇÃO =================

  const openNewProspectModal = () => {
    setEditingProspect(null);
    setProspectError(null);
    setProspectForm({
      businessName: "",
      category: "Clínica Odontológica / Dentista",
      city: "",
      contactName: "",
      phone: "",
      email: "",
      instagramOrSite: "",
      googleUrl: "",
      googleRating: "",
      googleReviewsCount: "",
      status: "mapped",
      channel: "whatsapp",
      notes: "",
      nextFollowUpDate: "",
    });
    setIsProspectModalOpen(true);
  };

  const openEditProspectModal = (p: Prospect) => {
    setEditingProspect(p);
    setProspectError(null);
    setProspectForm({
      businessName: p.businessName,
      category: p.category || "Negócio Local",
      city: p.city || "",
      contactName: p.contactName || "",
      phone: formatPhone(p.phone || ""),
      email: p.email || "",
      instagramOrSite: p.instagramOrSite || "",
      googleUrl: p.googleUrl || "",
      googleRating: p.googleRating || "",
      googleReviewsCount: p.googleReviewsCount ? String(p.googleReviewsCount) : "",
      status: p.status || "mapped",
      channel: p.channel || "whatsapp",
      notes: p.notes || "",
      nextFollowUpDate: p.nextFollowUpDate || "",
    });
    setIsProspectModalOpen(true);
  };

  const setQuickFollowUpDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyyMmDd = d.toISOString().split("T")[0];
    setProspectForm((prev) => ({ ...prev, nextFollowUpDate: yyyyMmDd }));
  };

  const handleSaveProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProspect(true);
    setProspectError(null);

    try {
      if (editingProspect) {
        const res = await fetch("/api/super-admin/prospects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProspect.id,
            ...prospectForm,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao atualizar prospecto.");

        setProspectsList((prev) =>
          prev.map((item) => (item.id === editingProspect.id ? data.prospect : item))
        );
      } else {
        const res = await fetch("/api/super-admin/prospects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prospectForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao cadastrar prospecto.");

        setProspectsList((prev) => [data.prospect, ...prev]);
      }

      setIsProspectModalOpen(false);
    } catch (err: any) {
      setProspectError(err.message || "Erro ao salvar prospecto.");
    } finally {
      setSavingProspect(false);
    }
  };

  const handleQuickProspectStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/super-admin/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setProspectsList((prev) =>
          prev.map((p) => (p.id === id ? data.prospect : p))
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar status do prospecto:", err);
    }
  };

  const handleDeleteProspect = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover "${name}" da sua lista de prospecção?`)) return;
    try {
      const res = await fetch(`/api/super-admin/prospects?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProspectsList((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir prospecto:", err);
    }
  };

  // Converter um Prospecto do CRM diretamente em Cliente Ativo no NotaLocal!
  const handleConvertToClient = (p: Prospect) => {
    setForm({
      name: p.businessName,
      slug: makeSlug(p.businessName),
      category: CATEGORY_OPTIONS.includes(p.category || "")
        ? p.category!
        : "Clínica Odontológica / Dentista",
      ownerEmail: p.email || "",
      googleReviewUrl: p.googleUrl || "",
      notificationPhone: formatPhone(p.phone || ""),
      paymentStatus: "active",
      coverColor: "#2563eb",
    });
    setIsModalOpen(true);
  };

  const buildProspectWhatsAppUrl = (p: Prospect) => {
    if (!p.phone) return null;
    const digits = p.phone.replace(/\D/g, "");
    const formatted = digits.startsWith("55") ? digits : `55${digits}`;
    const salutation = p.contactName ? `Olá ${p.contactName}, tudo bem?` : `Olá, tudo bem?`;
    const pitchBody = OFFICIAL_PITCH_TEXT.replace(/^Olá, tudo bem\?/, salutation);
    return `https://wa.me/${formatted}?text=${encodeURIComponent(pitchBody)}`;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const isFollowUpDue = (dateStr: string | null) => {
    if (!dateStr) return false;
    return dateStr <= todayStr;
  };

  const dueFollowUpsCount = prospectsList.filter(
    (p) => p.status !== "won" && isFollowUpDue(p.nextFollowUpDate)
  ).length;

  const filteredProspects = prospectsList.filter((p) => {
    const q = crmSearch.toLowerCase();
    const matchesSearch =
      p.businessName.toLowerCase().includes(q) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.contactName && p.contactName.toLowerCase().includes(q)) ||
      (p.notes && p.notes.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (crmStatusFilter === "all") return true;
    if (crmStatusFilter === "due_today") {
      return p.status !== "won" && isFollowUpDue(p.nextFollowUpDate);
    }
    return p.status === crmStatusFilter;
  });

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
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Logo />
            <div className="hidden sm:block h-5 w-[1px] bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                Master Admin
              </span>
              {adminEmail && (
                <span className="text-xs text-slate-400 hidden lg:inline font-mono">
                  {adminEmail}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/clinica-sorriso"
              target="_blank"
              className="hidden sm:flex text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl transition-all items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Ver Demonstração
            </Link>

            {activeSuperTab === "crm" ? (
              <button
                onClick={openNewProspectModal}
                className="text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-600 px-3 sm:px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Mapear Comércio</span>
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-3 sm:px-4 py-2 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Cliente</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
        {/* Seletor de Abas Principais: Clientes Ativos vs CRM de Prospecção */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveSuperTab("clients")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSuperTab === "clients"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Clientes & Contas ({businessesList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSuperTab("crm")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeSuperTab === "crm"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>CRM & Prospecção ({prospectsList.length})</span>
              {dueFollowUpsCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {dueFollowUpsCount} hoje
                </span>
              )}
            </button>
          </div>

          {activeSuperTab === "crm" && (
            <p className="text-xs text-slate-400 hidden md:block">
              Organize suas abordagens, anote objeções e acompanhe datas de retorno sem precisar de planilhas.
            </p>
          )}
        </div>

        {/* ==================== ABA 1: CLIENTES & ASSINATURAS ==================== */}
        {activeSuperTab === "clients" && (
          <>
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
                    businessesList.filter((b) => b.paymentStatus === "active" && !b.isDemo).length * 297
                  ).toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-slate-400 mt-1">Base Plano Anual (R$ 297 / 12x R$ 29,90)</p>
              </div>
            </div>

            {/* Section Clientes */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-6 backdrop-blur">
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

              {/* Lista Mobile em Cards (Exibida apenas em celulares < md) */}
              <div className="md:hidden space-y-3">
                {filteredBusinesses.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {b.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white text-sm flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{b.name}</span>
                            {b.isDemo && (
                              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                DEMO
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">/{b.slug}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(b.id, b.paymentStatus)}
                        className={`shrink-0 whitespace-nowrap text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
                          b.paymentStatus === "gift"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : b.paymentStatus === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {b.paymentStatus === "gift"
                          ? "🎁 Cortesia"
                          : b.paymentStatus === "active"
                          ? "Ativo"
                          : "Pendente"}
                      </button>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-2.5 space-y-1.5 text-xs border border-slate-800/80">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 shrink-0">E-mail:</span>
                        <span className="font-mono text-slate-200 truncate">
                          {b.ownerEmail || "Não vinculado"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 shrink-0">WhatsApp:</span>
                        <span className="text-slate-300 truncate">
                          {b.notificationPhone || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Avaliações:</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 text-xs">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {b.feedbackCount}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/${b.slug}`}
                        target="_blank"
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Página Pública</span>
                      </Link>
                      <Link
                        href={`/admin?businessId=${b.id}`}
                        className="py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Abrir Painel</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Desktop/Tablet */}
              <div className="hidden md:block overflow-x-auto">
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
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
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
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {b.ownerEmail}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Não vinculado</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-300 text-xs whitespace-nowrap">
                          {b.notificationPhone ? (
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              {b.notificationPhone}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">-</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-400 text-xs bg-amber-400/10 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {b.feedbackCount}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(b.id, b.paymentStatus)}
                            title="Clique para alternar (Ativo -> Cortesia -> Pendente)"
                            className={`whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
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

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/${b.slug}`}
                              target="_blank"
                              title="Abrir página pública de avaliação"
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

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
              </div>

              {filteredBusinesses.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  Nenhum estabelecimento encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================== ABA 2: CRM & PROSPECÇÃO COMERCIAL ==================== */}
        {activeSuperTab === "crm" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPIs do Funil de Vendas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-2xl backdrop-blur">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Comércios Mapeados</span>
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">{prospectsList.length}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {prospectsList.filter((p) => p.status === "mapped").length} aguardando 1º contato
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-2xl backdrop-blur">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Em Negociação / Contato</span>
                  <MessageCircle className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold text-indigo-400">
                  {
                    prospectsList.filter((p) =>
                      ["contacted", "demo_sent", "meeting", "followup"].includes(p.status)
                    ).length
                  }
                </div>
                <p className="text-xs text-slate-400 mt-1">Abordados, com vídeo ou reunião</p>
              </div>

              <div className="bg-slate-800/50 border border-amber-500/30 p-5 rounded-2xl backdrop-blur">
                <div className="flex items-center justify-between text-amber-300 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Retornar Hoje / Atrasados</span>
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-amber-400">{dueFollowUpsCount}</div>
                <p className="text-xs text-slate-400 mt-1">Follow-ups agendados para chamar hoje</p>
              </div>

              <div className="bg-slate-800/50 border border-emerald-500/30 p-5 rounded-2xl backdrop-blur">
                <div className="flex items-center justify-between text-emerald-300 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Vendas Fechadas</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {prospectsList.filter((p) => p.status === "won").length}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {prospectsList.filter((p) => p.status === "lost").length} em geladeira (tentar no futuro)
                </p>
              </div>
            </div>

            {/* Painel Principal do CRM */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-6 backdrop-blur space-y-6">
              {/* Cofre do Pitch Oficial & Estatísticas (Sempre à mão no CRM) */}
              <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        💎 Meu Roteiro Oficial de Abordagem & Estatísticas do Pitch
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Sua mensagem aprovada (já vai preenchida ao clicar em &quot;Chamar no Zap&quot;) + dados de mercado para reuniões.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(OFFICIAL_PITCH_TEXT);
                        setCopiedPitch(true);
                        setTimeout(() => setCopiedPitch(false), 2500);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Copiar Abordagem</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPitchPlaybook(!showPitchPlaybook)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
                    >
                      {showPitchPlaybook ? "Ocultar Roteiro" : "Ver Texto & Estatísticas"}
                    </button>
                  </div>
                </div>

                {showPitchPlaybook && (
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in duration-150">
                    <div className="lg:col-span-7 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                        Mensagem Oficial de 1º Contato (WhatsApp / Direct):
                      </span>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans select-all">
                        {OFFICIAL_PITCH_TEXT}
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                        📊 Estatísticas & Argumentos para Conversas:
                      </span>
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300 leading-relaxed">
                        <p>
                          <strong className="text-white">1. O Efeito &quot;Válvula de Escape&quot; (80%+):</strong>{" "}
                          Mais de 80% dos clientes insatisfeitos não vão ao Google por maldade; eles só reclamam em público quando não encontram um canal direto para serem ouvidos pela gerência na hora. Ao desabafar na nossa Ouvidoria Privada, a pessoa sente que já cumpriu seu objetivo.
                        </p>
                        <p>
                          <strong className="text-white">2. Recuperação de Clientes (70% a 90%):</strong>{" "}
                          Estudos de retenção mostram que entre 70% e 90% dos clientes que registram uma queixa privada e recebem retorno rápido do responsável não só deixam de reclamar no Google como voltam a comprar.
                        </p>
                        <p>
                          <strong className="text-white">3. Fim do &quot;Tiro no Pé&quot;:</strong>{" "}
                          Quando a empresa manda o link direto do Google para todos os clientes, ela mesma empurra para o Google quem teve um pequeno contratempo. Com o NotaLocal, você pede avaliação para 100% dos clientes com segurança.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Barra de Busca + Botão Novo Prospecto */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar comércio, cidade, nicho, responsável ou anotação..."
                    value={crmSearch}
                    onChange={(e) => setCrmSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={openNewProspectModal}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Mapear Novo Comércio</span>
                </button>
              </div>

              {/* Filtros por Etapa do Funil */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setCrmStatusFilter("all")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    crmStatusFilter === "all"
                      ? "bg-white text-slate-900 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Todos ({prospectsList.length})
                </button>

                <button
                  type="button"
                  onClick={() => setCrmStatusFilter("due_today")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    crmStatusFilter === "due_today"
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Retornar Hoje ({dueFollowUpsCount})</span>
                </button>

                {PROSPECT_STATUSES.map((st) => {
                  const count = prospectsList.filter((p) => p.status === st.id).length;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setCrmStatusFilter(st.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                        crmStatusFilter === st.id
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {st.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Lista de Prospectos em Cards Ricos (Responsivo para Mobile e Desktop) */}
              {filteredProspects.length === 0 ? (
                <div className="text-center py-14 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-6">
                  <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-300">
                    {prospectsList.length === 0
                      ? "Sua lista de prospecção ainda está vazia"
                      : "Nenhum comércio encontrado neste filtro"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {prospectsList.length === 0
                      ? "Comece mapeando comércios no Google (clínicas, confeitarias, restaurantes, oficinas com nota 3.8 a 4.5) e cadastre aqui para acompanhar cada conversa."
                      : "Tente mudar o filtro de status acima ou limpar o campo de busca."}
                  </p>
                  {prospectsList.length === 0 && (
                    <button
                      type="button"
                      onClick={openNewProspectModal}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar 1º Comércio Mapeado</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredProspects.map((p) => {
                    const statusObj =
                      PROSPECT_STATUSES.find((s) => s.id === p.status) || PROSPECT_STATUSES[0];
                    const zapUrl = buildProspectWhatsAppUrl(p);
                    const followUpOverdue = p.status !== "won" && isFollowUpDue(p.nextFollowUpDate);

                    return (
                      <div
                        key={p.id}
                        className={`bg-slate-900/80 border rounded-2xl p-4 sm:p-5 transition-all space-y-3.5 ${
                          followUpOverdue
                            ? "border-amber-500/60 shadow-lg shadow-amber-500/5"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* Linha 1: Nome da Empresa, Nicho, Cidade, Nota no Google + Seletor de Status */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-extrabold text-white">
                                {p.businessName}
                              </h4>

                              {p.category && (
                                <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700">
                                  {p.category}
                                </span>
                              )}

                              {p.city && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {p.city}
                                </span>
                              )}

                              {(p.googleRating || p.googleReviewsCount) && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {p.googleRating ? `${p.googleRating}` : ""}
                                  {p.googleReviewsCount ? ` (${p.googleReviewsCount} aval.)` : ""}
                                </span>
                              )}
                            </div>

                            {/* Informações de Contato Rápidas */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-0.5">
                              {p.contactName && (
                                <span className="flex items-center gap-1 text-slate-200 font-medium">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  {p.contactName}
                                </span>
                              )}
                              {p.phone && (
                                <span className="flex items-center gap-1 font-mono text-slate-300">
                                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                                  {formatPhone(p.phone)}
                                </span>
                              )}
                              {p.instagramOrSite && (
                                <span className="flex items-center gap-1 text-pink-300">
                                  <Globe className="w-3.5 h-3.5" />
                                  {p.instagramOrSite}
                                </span>
                              )}
                              {p.email && (
                                <span className="flex items-center gap-1 font-mono text-slate-400">
                                  <Mail className="w-3.5 h-3.5" />
                                  {p.email}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Seletor Rápido de Etapa do Funil */}
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={p.status}
                              onChange={(e) => handleQuickProspectStatusChange(p.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${statusObj.badgeClass}`}
                            >
                              {PROSPECT_STATUSES.map((st) => (
                                <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                                  {st.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Bloco de Anotações / Histórico da Conversa / Motivo da Negativa */}
                        {p.notes && (
                          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed flex items-start gap-2">
                            <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <div className="flex-1">{p.notes}</div>
                          </div>
                        )}

                        {/* Rodapé do Card: Datas de Contato/Retorno + Botões de Ação */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span>
                              Canal:{" "}
                              <strong className="text-slate-300">
                                {CHANNEL_OPTIONS.find((c) => c.id === p.channel)?.label || "WhatsApp"}
                              </strong>
                            </span>

                            {p.lastContactAt && (
                              <span>
                                • Último contato:{" "}
                                <strong className="text-slate-300">
                                  {new Date(p.lastContactAt).toLocaleDateString("pt-BR")}
                                </strong>
                              </span>
                            )}

                            {p.nextFollowUpDate && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                                  followUpOverdue
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                Retornar em:{" "}
                                {p.nextFollowUpDate.split("-").reverse().join("/")}
                                {followUpOverdue && " (Chamar Hoje!)"}
                              </span>
                            )}
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex flex-wrap items-center gap-2">
                            {zapUrl && (
                              <a
                                href={zapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Chamar no Zap</span>
                              </a>
                            )}

                            {p.googleUrl && (
                              <a
                                href={
                                  p.googleUrl.startsWith("http")
                                    ? p.googleUrl
                                    : `https://${p.googleUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                                title="Ver Perfil no Google"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                                <span>Google</span>
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => openEditProspectModal(p)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                              <span>Anotar / Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConvertToClient(p)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="Criar conta ativa no NotaLocal com os dados deste prospecto"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Virar Cliente</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProspect(p.id, p.businessName)}
                              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remover prospecto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==================== MODAL: MAPEAR / EDITAR PROSPECTO (CRM) ==================== */}
      {isProspectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsProspectModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingProspect ? `Editar Prospecto: ${editingProspect.businessName}` : "Mapear Novo Comércio para Prospecção"}
                </h3>
                <p className="text-xs text-slate-400">
                  Registre os dados do comércio, estágio da abordagem, objeções e data do próximo retorno.
                </p>
              </div>
            </div>

            {prospectError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                {prospectError}
              </div>
            )}

            <form onSubmit={handleSaveProspect} className="space-y-4">
              {/* Nome, Segmento e Cidade */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Comércio / Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Padaria Real"
                    value={prospectForm.businessName}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, businessName: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Segmento / Nicho
                  </label>
                  <select
                    value={prospectForm.category}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, category: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cidade / Bairro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sorocaba - Centro"
                    value={prospectForm.city}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, city: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Dados de Contato: Responsável, WhatsApp, Instagram, E-mail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Dono / Gerente / Contato
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Marcos (Dono) ou Carla (Recepção)"
                    value={prospectForm.contactName}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, contactName: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={prospectForm.phone}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, phone: formatPhone(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Instagram ou Site
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: @padariareal"
                    value={prospectForm.instagramOrSite}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, instagramOrSite: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-mail (se tiver)
                  </label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com.br"
                    value={prospectForm.email}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, email: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Situação Atual no Google (Ótimo para argumento de venda!) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  ⭐ Situação Atual no Google (Diagnóstico para abordar)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Nota Atual (Ex: 4.1)
                    </label>
                    <input
                      type="text"
                      placeholder="4.1"
                      value={prospectForm.googleRating}
                      onChange={(e) =>
                        setProspectForm({ ...prospectForm, googleRating: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Nº de Avaliações
                    </label>
                    <input
                      type="number"
                      placeholder="18"
                      value={prospectForm.googleReviewsCount}
                      onChange={(e) =>
                        setProspectForm({
                          ...prospectForm,
                          googleReviewsCount: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Link do Google da Empresa (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://maps.app.goo.gl/... ou link de avaliação"
                      value={prospectForm.googleUrl}
                      onChange={(e) =>
                        setProspectForm({ ...prospectForm, googleUrl: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status no Funil, Canal e Data de Retorno (Follow-up) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Etapa do Funil
                  </label>
                  <select
                    value={prospectForm.status}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, status: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {PROSPECT_STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Canal de Contato
                  </label>
                  <select
                    value={prospectForm.channel}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, channel: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CHANNEL_OPTIONS.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data de Retorno (Follow-up)
                  </label>
                  <input
                    type="date"
                    value={prospectForm.nextFollowUpDate}
                    onChange={(e) =>
                      setProspectForm({ ...prospectForm, nextFollowUpDate: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      { label: "Amanhã", days: 1 },
                      { label: "+3 dias", days: 3 },
                      { label: "+7 dias", days: 7 },
                      { label: "+15 dias", days: 15 },
                      { label: "+30 dias", days: 30 },
                    ].map((btn) => (
                      <button
                        key={btn.days}
                        type="button"
                        onClick={() => setQuickFollowUpDays(btn.days)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Anotações / Histórico / Objeções */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Histórico da Conversa / Objeções / Motivo da Negativa
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: 28/10 - Chamei no WhatsApp, deixaram enviar vídeo explicativo. Ficou de mostrar para o sócio na quinta-feira..."
                  value={prospectForm.notes}
                  onChange={(e) =>
                    setProspectForm({ ...prospectForm, notes: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProspectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingProspect}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingProspect
                    ? "Salvando..."
                    : editingProspect
                    ? "Salvar Alterações"
                    : "Salvar no CRM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CADASTRAR NOVO CLIENTE ATIVO ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      href={
                        form.googleReviewUrl.startsWith("http")
                          ? form.googleReviewUrl
                          : `https://${form.googleReviewUrl}`
                      }
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
                    placeholder="(11) 99999-9999"
                    value={form.notificationPhone}
                    onChange={handlePhoneChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Contato principal do gestor (as notificações de críticas vão para o e-mail e Ouvidoria).
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
                    <option value="active">Ativo (Pagante — Anual R$ 297 / Mensal R$ 49,90)</option>
                    <option value="gift">🎁 Cortesia / Amigo / Teste Grátis</option>
                    <option value="pending">Pendente (Aguardando Pagamento)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cor da Marca do Cliente (Cabeçalho da Avaliação)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {["#2563eb", "#0d9488", "#e11d48", "#d97706", "#ea580c", "#7c3aed", "#0f172a"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, coverColor: c })}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          form.coverColor === c
                            ? "border-white scale-110 shadow-sm"
                            : "border-transparent opacity-80 hover:opacity-100"
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
