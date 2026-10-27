import { db } from "@/lib/db";
import { businesses, feedbacks } from "@/lib/db/schema";
import { desc, eq, or } from "drizzle-orm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface AdminPageProps {
  searchParams: Promise<{
    businessId?: string;
    demo?: string;
  }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.userId;

  let currentBusiness = null;

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
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();

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
    // Se for modo de demonstração geral e existir clinica demo
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
    <AdminDashboard
      initialBusiness={currentBusiness}
      initialFeedbacks={allFeedbacks}
      allBusinesses={[currentBusiness]}
    />
  );
}
