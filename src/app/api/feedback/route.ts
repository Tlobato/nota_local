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

    // Disparo automático de alerta por e-mail via Resend API para notas de 1 a 3 estrelas
    if (!isHighRating && business.ownerEmail && process.env.RESEND_API_KEY) {
      try {
        const cleanCustomerPhone = customerPhone ? customerPhone.replace(/\D/g, "") : "";
        const whatsappCustomerLink = cleanCustomerPhone
          ? `https://wa.me/55${cleanCustomerPhone}?text=${encodeURIComponent(
              `Olá ${customerName || ""}, tudo bem? Aqui é da equipe do estabelecimento ${business.name}. Recebemos sua mensagem no nosso canal de atendimento e gostaríamos de conversar para resolver isso da melhor forma possível!`
            )}`
          : null;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || "NotaLocal Alerta <alertas@notalocal.com.br>",
            to: [business.ownerEmail],
            subject: `🚨 Crítica Retida (${rating}⭐) - ${business.name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #0f172a; margin-top: 0;">🚨 Nova Avaliação Retida na Ouvidoria</h2>
                <p style="color: #475569; font-size: 14px;">
                  O filtro inteligente do <strong>NotaLocal</strong> acabou de reter uma avaliação de <strong>${rating} estrela(s)</strong> antes que ela fosse publicada no perfil público do Google.
                </p>
                <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0; font-size: 14px; color: #1e293b;">
                  <p style="margin: 4px 0;"><strong>Estabelecimento:</strong> ${business.name}</p>
                  <p style="margin: 4px 0;"><strong>Nota:</strong> ${"⭐".repeat(rating)} (${rating}/5)</p>
                  <p style="margin: 4px 0;"><strong>Cliente:</strong> ${customerName || "Não informado"}</p>
                  <p style="margin: 4px 0;"><strong>WhatsApp do Cliente:</strong> ${customerPhone || "Não informado"}</p>
                  <p style="margin: 8px 0 0 0;"><strong>Relato:</strong><br/>${comment || "Sem comentário adicional"}</p>
                </div>
                ${
                  whatsappCustomerLink
                    ? `<a href="${whatsappCustomerLink}" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 20px; border-radius: 10px; font-size: 14px;">Chamar Cliente no WhatsApp Agora</a>`
                    : ""
                }
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Aviso: falha ao enviar e-mail Resend:", emailErr);
      }
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
