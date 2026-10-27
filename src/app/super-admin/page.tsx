import React from "react";
import { db } from "@/lib/db";
import { businesses, feedbacks } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import SuperAdminDashboard from "@/components/admin/SuperAdminDashboard";

export default async function SuperAdminPage() {
  // Buscar todas as empresas cadastradas
  const allBusinesses = await db.query.businesses.findMany({
    orderBy: [desc(businesses.createdAt)],
  });

  // Enriquecer com contagem de feedbacks
  const enrichedBusinesses = await Promise.all(
    allBusinesses.map(async (b) => {
      const counts = await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(feedbacks)
        .where(eq(feedbacks.businessId, b.id));

      return {
        ...b,
        feedbackCount: Number(counts[0]?.count || 0),
      };
    })
  );

  // Calcular métricas globais
  const totalBusinesses = enrichedBusinesses.length;
  const activeClients = enrichedBusinesses.filter((b) => b.paymentStatus === "active" && !b.isDemo).length;
  const totalFeedbacks = enrichedBusinesses.reduce((acc, curr) => acc + curr.feedbackCount, 0);
  const estimatedRevenue = activeClients * 490; // R$ 490 / ano ou setup

  return (
    <SuperAdminDashboard
      businesses={enrichedBusinesses}
      stats={{
        totalBusinesses,
        activeClients,
        totalFeedbacks,
        estimatedRevenue,
      }}
    />
  );
}
