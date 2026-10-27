import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedbacks, businesses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessSlug, rating, customerName, customerPhone, comment } = body;

    if (!businessSlug || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Dados inválidos. 'businessSlug' e 'rating' (1-5) são obrigatórios." },
        { status: 400 }
      );
    }

    // Buscar o estabelecimento pelo slug
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.slug, businessSlug),
    });

    if (!business) {
      return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
    }

    const isHighRating = rating >= 4;

    const [feedback] = await db
      .insert(feedbacks)
      .values({
        businessId: business.id,
        rating,
        customerName: customerName?.trim() || null,
        customerPhone: customerPhone?.trim() || null,
        comment: comment?.trim() || null,
        redirectedToGoogle: isHighRating,
        status: isHighRating ? "resolved" : "pending",
        userAgent: req.headers.get("user-agent") || null,
      })
      .returning();

    // Se for nota baixa e tiver telefone de notificação, podemos preparar alerta
    let whatsappAlertUrl = null;
    if (!isHighRating && business.notificationPhone) {
      const alertText = encodeURIComponent(
        `🚨 *ALERTA NOTALOCAL: Nova Crítica Retida!*\n\n` +
          `*Estabelecimento:* ${business.name}\n` +
          `*Nota:* ${"⭐".repeat(rating)} (${rating}/5)\n` +
          `*Cliente:* ${customerName || "Não informado"}\n` +
          `*Telefone:* ${customerPhone || "Não informado"}\n` +
          `*Comentário:* ${comment || "Sem comentário"}\n\n` +
          `👉 *Ação imediata:* Entre em contato com o cliente antes que ele poste no Google!`
      );
      whatsappAlertUrl = `https://wa.me/${business.notificationPhone.replace(/\D/g, "")}?text=${alertText}`;
    }

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      redirectedToGoogle: isHighRating,
      googleReviewUrl: isHighRating ? business.googleReviewUrl : null,
      whatsappAlertUrl,
    });
  } catch (error) {
    console.error("Erro ao salvar feedback:", error);
    return NextResponse.json({ error: "Erro interno ao processar avaliação." }, { status: 500 });
  }
}
