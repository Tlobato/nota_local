import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userEmail, isSuperAdmin } = await getAuthenticatedUser();

    const existing = await db.query.businesses.findFirst({
      where: eq(businesses.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const isOwner =
      Boolean(userId && existing.ownerId === userId) ||
      Boolean(userEmail && existing.ownerEmail?.toLowerCase().trim() === userEmail);

    if (!existing.isDemo && !isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Não autorizado a editar esta empresa." }, { status: 403 });
    }

    const body = await req.json();

    const [updated] = await db
      .update(businesses)
      .set({
        name: body.name,
        category: body.category,
        googleReviewUrl: body.googleReviewUrl,
        notificationPhone: body.notificationPhone,
        welcomeMessage: body.welcomeMessage,
        coverColor: body.coverColor,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id))
      .returning();

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    console.error("Erro ao atualizar dados da empresa:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
