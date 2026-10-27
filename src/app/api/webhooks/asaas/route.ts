import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    // Eventos de sucesso do Asaas: PAYMENT_RECEIVED ou PAYMENT_CONFIRMED
    if (event.event === "PAYMENT_RECEIVED" || event.event === "PAYMENT_CONFIRMED") {
      const paymentId = event.payment?.id;
      const customerId = event.payment?.customer;

      if (paymentId) {
        // Atualiza status do pagamento da empresa correspondente
        await db
          .update(businesses)
          .set({ paymentStatus: "active" })
          .where(eq(businesses.asaasPaymentId, paymentId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook Asaas:", error);
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}
