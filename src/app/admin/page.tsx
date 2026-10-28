import { db } from "@/lib/db";
import { businesses, feedbacks } from "@/lib/db/schema";
import { desc, eq, or } from "drizzle-orm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

interface AdminPageProps {
  searchParams: Promise<{
    businessId?: string;
    demo?: string;
  }>;
}

const ADMIN_EMAILS = [
  "thyagollobato@gmail.com",
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()) : []),
];

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.userId;

  let currentBusiness = null;
  let userEmail: string | undefined = undefined;

  if (userId) {
    const user = await currentUser();
    userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();
  }

  const isSuperAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

  // Se o Thyago logou e acessou /admin sem especificar um cliente específico, redireciona para o Super Admin
  if (isSuperAdmin && !params.businessId && params.demo !== "true") {
    redirect("/super-admin");
  }

  // 1. Se foi solicitada a visualização de demonstração
  if (params.demo === "true") {
    currentBusiness = await db.query.businesses.findFirst({
      where: eq(businesses.isDemo, true),
    });
  }

  // 2. Se o Super Admin passou um businessId específico
  if (!currentBusiness && params.businessId) {
    currentBusiness = await db.query.businesses.findFirst({
      where: eq(businesses.id, params.businessId),
    });
  }

  // 3. Se o usuário estiver autenticado, buscar pela conta dele
  if (!currentBusiness && userId) {
    // Buscar onde o ownerId é o userId OU o ownerEmail é o email cadastrado pelo Super Admin
    if (userEmail) {
      currentBusiness = await db.query.businesses.findFirst({
        where: or(eq(businesses.ownerId, userId), eq(businesses.ownerEmail, userEmail)),
      });
    } else {
      currentBusiness = await db.query.businesses.findFirst({
        where: eq(businesses.ownerId, userId),
      });
    }

    // Se encontramos a empresa pelo e-mail e o ownerId ainda estava vazio, vinculamos agora!
    if (currentBusiness && !currentBusiness.ownerId) {
      await db
        .update(businesses)
        .set({ ownerId: userId, updatedAt: new Date() })
        .where(eq(businesses.id, currentBusiness.id));
    }
  }

  // 4. Se não achou empresa e o usuário está logado, direcionar para onboarding
  if (!currentBusiness && userId) {
    redirect("/onboarding");
  }

  // 5. Se não achou empresa e não está logado, direcionar para login
  if (!currentBusiness) {
    const demoBusiness = await db.query.businesses.findFirst({
      where: eq(businesses.isDemo, true),
    });

    if (demoBusiness) {
      currentBusiness = demoBusiness;
    } else {
      redirect("/sign-in?redirect_url=/admin");
    }
  }

  // Buscar feedbacks da empresa atual
  const allFeedbacks = await db.query.feedbacks.findMany({
    where: eq(feedbacks.businessId, currentBusiness.id),
    orderBy: [desc(feedbacks.createdAt)],
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner se o Thyago estiver inspecionando uma empresa pelo Super Admin */}
      {isSuperAdmin && (
        <div className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sticky top-0 z-50">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">
              Painel de:{" "}
              <strong className="text-white">{currentBusiness.name}</strong>
            </span>
          </div>
          <Link
            href="/super-admin"
            className="shrink-0 flex items-center gap-1.5 font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </Link>
        </div>
      )}

      <AdminDashboard
        initialBusiness={currentBusiness}
        initialFeedbacks={allFeedbacks}
        allBusinesses={[currentBusiness]}
        serverNowMs={Date.now()}
      />
    </div>
  );
}
