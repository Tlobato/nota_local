"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Star,
  QrCode,
  Send,
  Settings,
  TrendingUp,
  MessageSquare,
  Phone,
  Copy,
  Check,
  Download,
  ExternalLink,
  Building2,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
  X,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import type { Business, Feedback } from "@/lib/db/schema";
import QRCodeLib from "qrcode";
import Logo from "@/components/Logo";

interface AdminDashboardProps {
  initialBusiness: Business;
  initialFeedbacks: Feedback[];
  allBusinesses: Business[];
}

export default function AdminDashboard({
  initialBusiness,
  initialFeedbacks,
  allBusinesses,
}: AdminDashboardProps) {
  const [currentBusiness, setCurrentBusiness] = useState<Business>(initialBusiness);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [activeTab, setActiveTab] = useState<"overview" | "feedbacks" | "qrcode" | "settings">("overview");

  // QR Code canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // WhatsApp quick dispatch state
  const [dispatchName, setDispatchName] = useState("");
  const [dispatchPhone, setDispatchPhone] = useState("");

  // Business settings form
  const [settingsForm, setSettingsForm] = useState({
    name: currentBusiness.name,
    category: currentBusiness.category || "",
    googleReviewUrl: currentBusiness.googleReviewUrl,
    notificationPhone: currentBusiness.notificationPhone || "",
    welcomeMessage: currentBusiness.welcomeMessage || "",
    coverColor: currentBusiness.coverColor || "#2563eb",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Estados de gestão de feedbacks e scripts
  const [selectedFeedbackForScripts, setSelectedFeedbackForScripts] = useState<Feedback | null>(null);
  const [editingResolutionId, setEditingResolutionId] = useState<string | null>(null);
  const [resolutionNotesInput, setResolutionNotesInput] = useState("");
  const [savingResolution, setSavingResolution] = useState(false);
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh inteligente (a cada 20s e ao focar a aba) sem consumir recursos exagerados
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchLatestFeedbacks = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        setIsRefreshing(true);
        const res = await fetch(`/api/feedback/poll?businessId=${currentBusiness.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.feedbacks) {
            setFeedbacks(data.feedbacks);
          }
        }
      } catch (err) {
        // Silencioso
      } finally {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    };

    const handleFocus = () => {
      fetchLatestFeedbacks();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    interval = setInterval(fetchLatestFeedbacks, 20000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      clearInterval(interval);
    };
  }, [currentBusiness.id]);

  // Métricas calculadas
  const totalReviews = feedbacks.length;
  const positiveReviews = feedbacks.filter((f) => f.rating >= 4 || f.redirectedToGoogle).length;
  const retainedCritiques = feedbacks.filter((f) => f.rating < 4 && !f.redirectedToGoogle).length;
  const protectionRate = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 100;

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/${currentBusiness.slug}` : `/${currentBusiness.slug}`;

  // Render QR Code on canvas
  useEffect(() => {
    if (canvasRef.current && publicUrl) {
      QRCodeLib.toCanvas(canvasRef.current, publicUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
    }
  }, [publicUrl, activeTab]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadQrCode = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `qrcode-${currentBusiness.slug}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  const handleUpdateStatus = async (feedbackId: string, newStatus: string, notes?: string) => {
    try {
      const payload: Record<string, any> = { status: newStatus };
      if (notes !== undefined) payload.resolutionNotes = notes;

      const res = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setFeedbacks((prev) =>
          prev.map((f) =>
            f.id === feedbackId
              ? {
                  ...f,
                  status: newStatus,
                  resolutionNotes: notes !== undefined ? notes : f.resolutionNotes,
                  resolvedAt: newStatus === "resolved" ? new Date() : null,
                }
              : f
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveResolution = async (feedbackId: string) => {
    setSavingResolution(true);
    try {
      await handleUpdateStatus(feedbackId, "resolved", resolutionNotesInput.trim());
      setEditingResolutionId(null);
      setResolutionNotesInput("");
    } finally {
      setSavingResolution(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch(`/api/business/${currentBusiness.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentBusiness(data.business);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar configurações.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Dispatch WhatsApp link builder
  const quickDispatchUrl = () => {
    const cleanPhone = dispatchPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const message = encodeURIComponent(
      `Olá ${dispatchName.trim() || "tudo bem?"}! Aqui é da equipe da ${currentBusiness.name}.\n\n` +
        `Foi um prazer atender você! Poderia nos avaliar rapidamente no link abaixo? Leva apenas 10 segundos e nos ajuda muito:\n` +
        `${publicUrl}`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <Logo variant="dark" showRatingBadge={false} />
            <span className="block text-[10px] text-blue-400 uppercase tracking-widest font-semibold mt-1 ml-11">
              Painel Gestor
            </span>
          </div>
        </div>

        {/* Seletor de Estabelecimento */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/50">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Empresa Ativa
          </label>
          <div className="flex items-center gap-2 text-white font-medium text-sm truncate">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">{currentBusiness.name}</span>
          </div>
        </div>

        {/* Navegação */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Visão Geral & Métricas</span>
          </button>

          <button
            onClick={() => setActiveTab("feedbacks")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "feedbacks"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4" />
              <span>Críticas Retidas</span>
            </div>
            {retainedCritiques > 0 && (
              <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
                {retainedCritiques}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("qrcode")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "qrcode"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code & Envio Zap</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "settings"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex flex-col gap-2">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <span className="truncate text-xs">Página Pública</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 max-w-6xl overflow-y-auto">
        {/* TAB 1: VISÃO GERAL */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Painel de Blindagem e Reputação
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Acompanhe em tempo real o fluxo de avaliações e proteção de notas da sua empresa.
              </p>
            </div>

            {/* Grid de 4 Cards de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total de Interações
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-slate-900">{totalReviews}</span>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">Clientes que escanearam ou acessaram</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Direcionados ao Google (5⭐)
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-emerald-600">{positiveReviews}</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Star className="w-4 h-4 fill-emerald-500" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600/80 mt-3">Multiplicando sua média pública</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Críticas Retidas (1-3⭐)
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-amber-600">{retainedCritiques}</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-amber-700/80 mt-3">Evitadas de queimar a nota pública</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Índice de Blindagem
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-extrabold text-blue-600">{protectionRate}%</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-blue-700/80 mt-3">Críticas 100% contidas internamente</p>
              </div>
            </div>

            {/* Banner de Demonstração de Impacto */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="inline-block bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-400/30">
                  🚀 O Poder da Blindagem NotaLocal
                </span>
                <h3 className="text-xl font-bold">
                  Sua empresa já evitou {retainedCritiques} nota(s) negativa(s) pública(s)!
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-xl">
                  Cada crítica retida internamente poupou seu negócio de perder posições nas pesquisas do Google Maps e preservou pacientes/clientes que pesquisam antes de fechar negócio.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("feedbacks")}
                className="shrink-0 px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span>Ver Críticas Retidas</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Últimos Feedbacks Recebidos */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Últimas Avaliações Recebidas
              </h3>
              <div className="divide-y divide-slate-100">
                {feedbacks.slice(0, 5).map((f) => (
                  <div key={f.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= f.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-100"
                            }`}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {f.customerName || "Cliente anônimo"}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-md">
                          {f.comment || (f.redirectedToGoogle ? "Avaliação 5 estrelas enviada ao Google Maps" : "Sem comentário escrito")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          f.redirectedToGoogle
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {f.redirectedToGoogle ? "Enviado ao Google" : "Retido no Painel"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CRÍTICAS RETIDAS (OUVIDORIA) */}
        {activeTab === "feedbacks" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Críticas Retidas (Ouvidoria Privada)
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Feedbacks de 1 a 3 estrelas que foram bloqueados do Google Maps para que você possa resolver antes de virar queixa pública.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-xs shrink-0 self-start sm:self-auto">
                <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Atualização automática ativa</span>
              </div>
            </div>

            <div className="space-y-4">
              {feedbacks
                .filter((f) => !f.redirectedToGoogle)
                .map((f) => {
                  const hasPhone = Boolean(f.customerPhone);
                  const cleanPhone = f.customerPhone ? f.customerPhone.replace(/\D/g, "") : "";
                  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
                  const quickGreetUrl = hasPhone
                    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                        `Olá ${f.customerName || ""}! Tudo bem?\n\nAqui é o atendimento da ${currentBusiness.name}. Vimos seu recado e fizemos questão de entrar em contato pessoalmente. Sentimos muito pela sua experiência e gostaríamos de entender exatamente para solucionar para você!`
                      )}`
                    : null;

                  return (
                    <div
                      key={f.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 transition-all hover:border-slate-300"
                    >
                      {/* Topo do Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= f.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200 fill-slate-100"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {f.rating} de 5 estrelas
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(f.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Status Select */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status do Caso:</span>
                          <select
                            value={f.status || "pending"}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              if (newStatus === "resolved" && !f.resolutionNotes) {
                                setEditingResolutionId(f.id);
                                setResolutionNotesInput("");
                              }
                              handleUpdateStatus(f.id, newStatus);
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors cursor-pointer ${
                              f.status === "resolved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : f.status === "contacted"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            <option value="pending">⏳ Pendente</option>
                            <option value="contacted">📞 Em Contato</option>
                            <option value="resolved">✓ Resolvido</option>
                          </select>
                        </div>
                      </div>

                      {/* Informações do Cliente */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                          <span>{f.customerName || "Cliente anônimo"}</span>
                          {hasPhone ? (
                            <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1 font-semibold">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {f.customerPhone}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic font-normal bg-slate-100 px-2.5 py-0.5 rounded-md">
                              Telefone não informado (avaliação anônima)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Relato do Cliente */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-slate-700 text-sm leading-relaxed">
                        &quot;{f.comment || "Nenhum comentário por escrito deixado pelo cliente."}&quot;
                      </div>

                      {/* Ações Inteligentes: Apoio ao Dono */}
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {hasPhone ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={quickGreetUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Chamar no Zap</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => setSelectedFeedbackForScripts(f)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Guia & Scripts de Reversão para 5⭐</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2.5 bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-xs text-amber-900 flex-1">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-semibold">Como agir neste caso (Sem telefone):</strong>
                              <span>
                                Como o cliente optou por não informar contato, use este relato para alinhar com sua equipe sobre o ponto citado e prevenir que novos clientes sintam a mesma insatisfação.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Botão de Registro de Resolução */}
                        <div className="shrink-0 flex items-center justify-end">
                          {editingResolutionId !== f.id && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingResolutionId(f.id);
                                setResolutionNotesInput(f.resolutionNotes || "");
                              }}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              {f.resolutionNotes ? "Editar Resolução" : "+ Anotar como foi resolvido"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Caixa de Anotação de Resolução */}
                      {editingResolutionId === f.id ? (
                        <div className="mt-2 bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl space-y-2">
                          <label className="block text-xs font-bold text-blue-900">
                            Como este caso foi resolvido internamente?
                          </label>
                          <textarea
                            rows={2}
                            value={resolutionNotesInput}
                            onChange={(e) => setResolutionNotesInput(e.target.value)}
                            placeholder="Ex: Conversei com o cliente no WhatsApp, esclarecemos o mal-entendido, oferecemos uma cortesia na próxima visita e ele saiu satisfeito."
                            className="w-full bg-white border border-blue-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingResolutionId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={savingResolution}
                              onClick={() => handleSaveResolution(f.id)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              {savingResolution ? "Salvando..." : "Salvar Resolução"}
                            </button>
                          </div>
                        </div>
                      ) : f.resolutionNotes ? (
                        <div className="mt-2 bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold block text-emerald-950">Histórico de Resolução:</span>
                            <span className="text-emerald-800">{f.resolutionNotes}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}

              {feedbacks.filter((f) => !f.redirectedToGoogle).length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
                  <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">
                    Nenhuma crítica retida no momento!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Todas as avaliações recentes foram positivas e direcionadas ao Google Maps.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: QR CODE & DISPARO WHATSAPP */}
        {activeTab === "qrcode" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                QR Code & Disparo Rápido
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Utilize o QR Code físico no balcão da sua empresa ou envie convites em 1 clique pelo WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1: QR Code Oficial */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Display de Balcão
                </span>
                <h3 className="text-base font-bold text-slate-800 mb-4">
                  QR Code Oficial da {currentBusiness.name}
                </h3>

                {/* Canvas do QR Code */}
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner mb-4">
                  <canvas ref={canvasRef} className="rounded-lg" />
                </div>

                <div className="w-full flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>

                <button
                  onClick={downloadQrCode}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-md shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Imagem em Alta Resolução (PNG)</span>
                </button>
              </div>

              {/* Card 2: Disparo 1-Clique WhatsApp (Sem Risco de Ban e Sem API) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full mb-2 border border-emerald-200">
                    ⚡ Disparo de Alta Conversão
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Enviar Convite no WhatsApp da Recepcionista
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    A recepcionista só digita o nome e o número do cliente que acabou de ser atendido. Ao clicar, o WhatsApp abre automaticamente com a mensagem e o link prontos.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nome do Cliente
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Carlos Oliveira"
                        value={dispatchName}
                        onChange={(e) => setDispatchName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        WhatsApp do Cliente (com DDD)
                      </label>
                      <input
                        type="tel"
                        placeholder="Ex: 15998383997"
                        value={dispatchPhone}
                        onChange={(e) => setDispatchPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Preview da Mensagem */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-700 mb-0.5">Mensagem que será enviada:</p>
                      <p className="italic">
                        "Olá {dispatchName || "[Nome]"}! Aqui é da equipe da {currentBusiness.name}. Foi um prazer atender você! Poderia nos avaliar rapidamente? {publicUrl}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href={quickDispatchUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all shadow-md ${
                      dispatchPhone.length >= 8
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
                        : "bg-slate-300 pointer-events-none"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Abrir WhatsApp com Mensagem Pronta</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONFIGURAÇÕES */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Configurações da Empresa
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Altere o link oficial de avaliação do Google Maps, número de alerta e identidade visual.
              </p>
            </div>

            {settingsSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Configurações salvas com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Estabelecimento
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={settingsForm.category}
                  onChange={(e) => setSettingsForm({ ...settingsForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link Direto de Avaliação no Google Maps
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={settingsForm.googleReviewUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, googleReviewUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  É para este link que os clientes que derem 4 ou 5 estrelas serão redirecionados.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp para Alertas Imediatos (Gerente / Dono)
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 5515998383997"
                  value={settingsForm.notificationPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, notificationPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mensagem de Boas-Vindas
                </label>
                <input
                  type="text"
                  value={settingsForm.welcomeMessage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-md disabled:opacity-50"
                >
                  {savingSettings ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Modal de Guia & Scripts de Reversão para 5 Estrelas */}
      {selectedFeedbackForScripts && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedFeedbackForScripts(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Guia & Scripts de Reversão para 5⭐
                </h3>
                <p className="text-xs text-slate-500">
                  Como transformar a insatisfação de {selectedFeedbackForScripts.customerName || "este cliente"} em uma avaliação 5 estrelas no Google.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-slate-800">
              {/* Script 1 */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    Passo 1: Acolhimento & Desculpas Sinceras
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = `Olá, ${selectedFeedbackForScripts.customerName || ""}! Tudo bem?\n\nAqui é o responsável pelo atendimento da ${currentBusiness.name}. Recebi a sua mensagem no nosso canal de ouvidoria e fiz questão de entrar em contato pessoalmente.\n\nSentimos muito que sua experiência não tenha sido 100% satisfatória. Valorizamos muito sua opinião e gostaríamos de entender exatamente o que houve para podermos corrigir para você agora.`;
                        navigator.clipboard.writeText(text);
                        setCopiedScriptIndex(1);
                        setTimeout(() => setCopiedScriptIndex(null), 2000);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedScriptIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedScriptIndex === 1 ? "Copiado!" : "Copiar"}
                    </button>
                    {selectedFeedbackForScripts.customerPhone && (
                      <a
                        href={`https://wa.me/55${selectedFeedbackForScripts.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Olá, ${selectedFeedbackForScripts.customerName || ""}! Tudo bem?\n\nAqui é o responsável pelo atendimento da ${currentBusiness.name}. Recebi a sua mensagem no nosso canal de ouvidoria e fiz questão de entrar em contato pessoalmente.\n\nSentimos muito que sua experiência não tenha sido 100% satisfatória. Valorizamos muito sua opinião e gostaríamos de entender exatamente o que houve para podermos corrigir para você agora.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Disparar no Zap
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 whitespace-pre-wrap font-sans bg-white p-3 rounded-xl border border-slate-200">
                  {`Olá, ${selectedFeedbackForScripts.customerName || ""}! Tudo bem?\n\nAqui é o responsável pelo atendimento da ${currentBusiness.name}. Recebi a sua mensagem no nosso canal de ouvidoria e fiz questão de entrar em contato pessoalmente.\n\nSentimos muito que sua experiência não tenha sido 100% satisfatória. Valorizamos muito sua opinião e gostaríamos de entender exatamente o que houve para podermos corrigir para você agora.`}
                </p>
              </div>

              {/* Script 2 */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    Passo 2: Compensação & Encantamento
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = `${selectedFeedbackForScripts.customerName || "Olá"}, compreendemos perfeitamente o seu ponto e já alinhamos com a equipe para que isso não se repita.\n\nComo forma de nos desculparmos pelo transtorno, gostaríamos de oferecer a você [uma cortesia especial / um desconto de X%] em sua próxima visita, com atendimento prioritário. Seria um prazer receber você novamente para demonstrar o nosso verdadeiro padrão!`;
                        navigator.clipboard.writeText(text);
                        setCopiedScriptIndex(2);
                        setTimeout(() => setCopiedScriptIndex(null), 2000);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedScriptIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedScriptIndex === 2 ? "Copiado!" : "Copiar"}
                    </button>
                    {selectedFeedbackForScripts.customerPhone && (
                      <a
                        href={`https://wa.me/55${selectedFeedbackForScripts.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `${selectedFeedbackForScripts.customerName || "Olá"}, compreendemos perfeitamente o seu ponto e já alinhamos com a equipe para que isso não se repita.\n\nComo forma de nos desculparmos pelo transtorno, gostaríamos de oferecer a você [uma cortesia especial / um desconto de X%] em sua próxima visita, com atendimento prioritário. Seria um prazer receber você novamente para demonstrar o nosso verdadeiro padrão!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Disparar no Zap
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 whitespace-pre-wrap font-sans bg-white p-3 rounded-xl border border-slate-200">
                  {`${selectedFeedbackForScripts.customerName || "Olá"}, compreendemos perfeitamente o seu ponto e já alinhamos com a equipe para que isso não se repita.\n\nComo forma de nos desculparmos pelo transtorno, gostaríamos de oferecer a você [uma cortesia especial / um desconto de X%] em sua próxima visita, com atendimento prioritário. Seria um prazer receber você novamente para demonstrar o nosso verdadeiro padrão!`}
                </p>
              </div>

              {/* Script 3 */}
              <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Passo 3: A Mágica da Reversão para 5⭐ no Google
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = `${selectedFeedbackForScripts.customerName || "Olá"}, ficamos muito felizes que conseguimos resolver tudo e deixar você satisfeito(a)!\n\nA reputação da nossa empresa no Google Maps é muito valiosa para nós. Você nos daria uma grande força deixando uma avaliação sincera de 5 estrelas sobre como cuidamos de você e resolvemos a situação?\n\nLeva menos de 10 segundos por este link direto:\n${currentBusiness.googleReviewUrl}\n\nMuito obrigado pela confiança e carinho! ⭐⭐⭐⭐⭐`;
                        navigator.clipboard.writeText(text);
                        setCopiedScriptIndex(3);
                        setTimeout(() => setCopiedScriptIndex(null), 2000);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedScriptIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedScriptIndex === 3 ? "Copiado!" : "Copiar"}
                    </button>
                    {selectedFeedbackForScripts.customerPhone && (
                      <a
                        href={`https://wa.me/55${selectedFeedbackForScripts.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `${selectedFeedbackForScripts.customerName || "Olá"}, ficamos muito felizes que conseguimos resolver tudo e deixar você satisfeito(a)!\n\nA reputação da nossa empresa no Google Maps é muito valiosa para nós. Você nos daria uma grande força deixando uma avaliação sincera de 5 estrelas sobre como cuidamos de você e resolvemos a situação?\n\nLeva menos de 10 segundos por este link direto:\n${currentBusiness.googleReviewUrl}\n\nMuito obrigado pela confiança e carinho! ⭐⭐⭐⭐⭐`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Disparar no Zap
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 whitespace-pre-wrap font-sans bg-white p-3 rounded-xl border border-emerald-200">
                  {`${selectedFeedbackForScripts.customerName || "Olá"}, ficamos muito felizes que conseguimos resolver tudo e deixar você satisfeito(a)!\n\nA reputação da nossa empresa no Google Maps é muito valiosa para nós. Você nos daria uma grande força deixando uma avaliação sincera de 5 estrelas sobre como cuidamos de você e resolvemos a situação?\n\nLeva menos de 10 segundos por este link direto:\n${currentBusiness.googleReviewUrl}\n\nMuito obrigado pela confiança e carinho! ⭐⭐⭐⭐⭐`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedFeedbackForScripts(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fechar Guia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
