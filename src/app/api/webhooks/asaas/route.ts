import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Se houver token de segurança de webhook configurado, valida o cabeçalho oficial do Asaas
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (expectedToken) {
      const receivedToken = req.headers.get("asaas-access-token");
      if (receivedToken !== expectedToken) {
        return NextResponse.json({ error: "Webhook token inválido" }, { status: 401 });
      }
    }

    const event = await req.json();

    // Eventos de sucesso do Asaas: PAYMENT_RECEIVED ou PAYMENT_CONFIRMED
    if (event.event === "PAYMENT_RECEIVED" || event.event === "PAYMENT_CONFIRMED") {
      const paymentId = event.payment?.id;
      const subscriptionId = event.payment?.subscription;
      const customerId = event.payment?.customer;

      const conditions = [];
      if (paymentId) conditions.push(eq(businesses.asaasPaymentId, paymentId));
      if (subscriptionId) conditions.push(eq(businesses.asaasPaymentId, subscriptionId));
      if (customerId) conditions.push(eq(businesses.asaasCustomerId, customerId));

      if (conditions.length > 0) {
        await db
          .update(businesses)
          .set({ paymentStatus: "active", updatedAt: new Date() })
          .where(or(...conditions));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook Asaas:", error);
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}
