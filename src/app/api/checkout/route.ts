import { NextRequest, NextResponse } from "next/server";
import {
  createAsaasCustomer,
  createAsaasPayment,
  createAsaasSubscription,
} from "@/lib/asaas";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, cpfCnpj, phone, plan = "annual", businessId } = body;

    if (!name || !email || !cpfCnpj) {
      return NextResponse.json(
        { error: "Nome, e-mail e CPF/CNPJ são obrigatórios para a emissão da cobrança." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Se o Asaas não estiver configurado (ambiente sem chave), simula
    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({
        success: true,
        isSimulated: true,
        message: "Modo demonstração: configure ASAAS_API_KEY no .env.local para cobranças reais.",
        paymentUrl: "/onboarding",
      });
    }

    // 1. Criar cliente no Asaas
    const customer = await createAsaasCustomer({
      name,
      email: cleanEmail,
      cpfCnpj,
      phone,
    });

    // 2. Data de vencimento para hoje + 2 dias
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    const dueDateString = dueDate.toISOString().split("T")[0];

    let createdPaymentId = "";
    let createdPaymentUrl = "";

    // 3. Gerar Cobrança conforme o plano escolhido (Anual R$ 297 em até 12x ou Mensal R$ 49,90/mês)
    if (plan === "monthly") {
      const subscription = await createAsaasSubscription({
        customerId: customer.id,
        value: 49.9,
        description: "NotaLocal - Plano Mensal (Blindagem de Reputação no Google)",
        nextDueDate: dueDateString,
      });

      createdPaymentId = subscription.id;
      createdPaymentUrl = subscription.invoiceUrl;
    } else {
      const payment = await createAsaasPayment({
        customerId: customer.id,
        value: 297.0,
        description: "NotaLocal - Plano Anual (12 Meses de Blindagem de Reputação no Google)",
        dueDate: dueDateString,
        maxInstallmentCount: 12,
      });

      createdPaymentId = payment.id;
      createdPaymentUrl = payment.invoiceUrl || payment.bankSlipUrl;
    }

    // 4. Se a empresa já existir (ex: estava em Teste de 7 Dias ou Pendente), vincula o customerId e paymentId do Asaas para liberação automática no Webhook!
    try {
      const session = await auth();
      const userId = session?.userId;
      const user = userId ? await currentUser() : null;
      const loggedEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();

      let targetBusiness = null;

      if (businessId) {
        targetBusiness = await db.query.businesses.findFirst({
          where: eq(businesses.id, businessId),
        });
      }

      if (!targetBusiness) {
        const conditions = [eq(businesses.ownerEmail, cleanEmail)];
        if (userId) conditions.push(eq(businesses.ownerId, userId));
        if (loggedEmail) conditions.push(eq(businesses.ownerEmail, loggedEmail));

        targetBusiness = await db.query.businesses.findFirst({
          where: or(...conditions),
        });
      }

      if (targetBusiness) {
        await db
          .update(businesses)
          .set({
            asaasCustomerId: customer.id,
            asaasPaymentId: createdPaymentId,
            updatedAt: new Date(),
          })
          .where(eq(businesses.id, targetBusiness.id));
      }
    } catch (linkErr) {
      console.error("Aviso ao vincular cobrança Asaas à empresa existente:", linkErr);
    }

    return NextResponse.json({
      success: true,
      paymentId: createdPaymentId,
      paymentUrl: createdPaymentUrl,
    });
  } catch (error: any) {
    console.error("Erro no checkout Asaas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao gerar link de pagamento no Asaas." },
      { status: 500 }
    );
  }
}
