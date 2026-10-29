import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, feedbacks } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId é obrigatório" }, { status: 400 });
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
    });

    if (!business) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    if (!business.isDemo) {
      const { userId, userEmail, isSuperAdmin } = await getAuthenticatedUser();
      const isOwner =
        Boolean(userId && business.ownerId === userId) ||
        Boolean(userEmail && business.ownerEmail?.toLowerCase().trim() === userEmail);

      if (!isOwner && !isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    }

    const allFeedbacks = await db.query.feedbacks.findMany({
      where: eq(feedbacks.businessId, businessId),
      orderBy: [desc(feedbacks.createdAt)],
    });

    return NextResponse.json({ success: true, feedbacks: allFeedbacks });
  } catch (error) {
    console.error("Erro no polling de feedbacks:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

