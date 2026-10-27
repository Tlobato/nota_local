import { db } from "@/lib/db";
import { businesses, feedbacks } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  // Buscar estabelecimentos
  const allBusinesses = await db.query.businesses.findMany({
    orderBy: [desc(businesses.createdAt)],
  });

  const currentBusiness = allBusinesses[0];

  if (!currentBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Nenhum estabelecimento cadastrado</h2>
          <p className="text-xs text-slate-500 mb-4">
            Execute o script de seed para criar seu primeiro estabelecimento de demonstração.
          </p>
        </div>
      </div>
    );
  }

  // Buscar feedbacks do estabelecimento atual
  const allFeedbacks = await db.query.feedbacks.findMany({
    where: eq(feedbacks.businessId, currentBusiness.id),
    orderBy: [desc(feedbacks.createdAt)],
  });

  return (
    <AdminDashboard
      initialBusiness={currentBusiness}
      initialFeedbacks={allFeedbacks}
      allBusinesses={allBusinesses}
    />
  );
}
