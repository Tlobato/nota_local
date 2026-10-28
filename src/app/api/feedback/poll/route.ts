import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId é obrigatório" }, { status: 400 });
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
