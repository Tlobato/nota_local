import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, resolutionNotes } = await req.json();

    if (!["pending", "contacted", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { status };
    if (resolutionNotes !== undefined) {
      updatePayload.resolutionNotes = resolutionNotes;
    }
    if (status === "resolved") {
      updatePayload.resolvedAt = new Date();
    } else {
      updatePayload.resolvedAt = null;
    }

    const [updated] = await db
      .update(feedbacks)
      .set(updatePayload)
      .where(eq(feedbacks.id, id))
      .returning();

    return NextResponse.json({ success: true, feedback: updated });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
