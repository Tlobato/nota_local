import React from "react";
import { db } from "@/lib/db";
import { businesses, feedbacks, prospects } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import SuperAdminDashboard from "@/components/admin/SuperAdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

const ADMIN_EMAILS = [
  "thyagollobato@gmail.com",
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()) : []),
];

export default async function SuperAdminPage() {
  const session = await auth();
  const userId = session?.userId;

  // 1. Se não estiver logado, redireciona para login e volta para /super-admin após autenticação
  if (!userId) {
    redirect("/sign-in?redirect_url=/super-admin");
  }

  // 2. Obter dados do usuário logado
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();

  // 3. Verificar se o e-mail é o do Thyago (Super Admin)
  const isSuperAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito ao Fundador</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Esta área é exclusiva para a gestão central da plataforma NotaLocal. A sua conta atual (
            <span className="font-mono text-slate-200">{userEmail || "Sem e-mail"}</span>) não possui permissão de
            Super Admin.
          </p>
          <div className="space-y-3">
            <Link
              href="/admin"
              className="block w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              Ir para o meu Painel de Empresa
            </Link>
            <Link
              href="/sign-in"
              className="block w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Trocar de Conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Buscar empresas, prospectos e contagem de avaliações em 1 única rodada paralela (elimina N+1 queries)
  const [allBusinesses, allProspects, feedbackCounts] = await Promise.all([
    db.query.businesses.findMany({
      orderBy: [desc(businesses.createdAt)],
    }),
    db.query.prospects.findMany({
      orderBy: [desc(prospects.createdAt)],
    }),
    db
      .select({
        businessId: feedbacks.businessId,
        count: sql<number>`count(*)`,
      })
      .from(feedbacks)
      .groupBy(feedbacks.businessId),
  ]);

  const countMap = new Map<string, number>();
  for (const row of feedbackCounts) {
    countMap.set(row.businessId, Number(row.count || 0));
  }

  const enrichedBusinesses = allBusinesses.map((b) => ({
    ...b,
    feedbackCount: countMap.get(b.id) || 0,
  }));

  // Calcular métricas globais
  const totalBusinesses = enrichedBusinesses.length;
  const activeClients = enrichedBusinesses.filter(
    (b) => (b.paymentStatus === "active" || b.paymentStatus === "gift") && !b.isDemo
  ).length;
  const totalFeedbacks = enrichedBusinesses.reduce((acc, curr) => acc + curr.feedbackCount, 0);
  const estimatedRevenue = enrichedBusinesses.filter((b) => b.paymentStatus === "active" && !b.isDemo).length * 297;

  return (
    <SuperAdminDashboard
      businesses={enrichedBusinesses}
      initialProspects={allProspects}
      stats={{
        totalBusinesses,
        activeClients,
        totalFeedbacks,
        estimatedRevenue,
      }}
      adminEmail={userEmail}
    />
  );
}
