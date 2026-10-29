import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, feedbacks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingFeedback = await db.query.feedbacks.findFirst({
      where: eq(feedbacks.id, id),
    });

    if (!existingFeedback) {
      return NextResponse.json({ error: "Feedback não encontrado" }, { status: 404 });
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, existingFeedback.businessId),
    });

    if (business && !business.isDemo) {
      const { userId, userEmail, isSuperAdmin } = await getAuthenticatedUser();
      const isOwner =
        Boolean(userId && business.ownerId === userId) ||
        Boolean(userEmail && business.ownerEmail?.toLowerCase().trim() === userEmail);

      if (!isOwner && !isSuperAdmin) {
        return NextResponse.json({ error: "Não autorizado a excluir este feedback" }, { status: 403 });
      }
    }

    await db.delete(feedbacks).where(eq(feedbacks.id, id));

    return NextResponse.json({ success: true, message: "Feedback excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir feedback:", error);
    return NextResponse.json({ error: "Erro interno ao excluir feedback" }, { status: 500 });
  }
}
