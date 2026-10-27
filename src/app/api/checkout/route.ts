import { NextRequest, NextResponse } from "next/server";
import { createAsaasCustomer, createAsaasPayment } from "@/lib/asaas";

const VALID_COUPONS = ["THYAGO100", "CORTESIA", "TESTE100", "VIP100", "PRESENTE"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, cpfCnpj, phone, coupon } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanCoupon = coupon?.trim().toUpperCase();
    const isFreeCoupon = cleanCoupon && VALID_COUPONS.includes(cleanCoupon);

    // Se usou um cupom de 100% de cortesia/teste, libera instantaneamente sem cobrar nada
    if (isFreeCoupon) {
      return NextResponse.json({
        success: true,
        isFree: true,
        message: `Cupom ${cleanCoupon} aplicado! Licença cortesia 100% gratuita liberada.`,
        paymentUrl: "/onboarding?status=gift",
      });
    }

    // Caso não seja cupom cortesia, CPF/CNPJ é necessário para o Asaas
    if (!cpfCnpj) {
      return NextResponse.json(
        { error: "CPF ou CNPJ é obrigatório para emissão da cobrança bancária." },
        { status: 400 }
      );
    }

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
      email,
      cpfCnpj,
      phone,
    });

    // 2. Data de vencimento para hoje + 2 dias
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    const dueDateString = dueDate.toISOString().split("T")[0];

    // 3. Gerar Cobrança de R$ 490,00 com opção de até 12x no cartão ou Pix
    const payment = await createAsaasPayment({
      customerId: customer.id,
      value: 490.0,
      description: "NotaLocal - Setup & Blindagem de Reputação no Google Maps",
      dueDate: dueDateString,
      maxInstallmentCount: 12,
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: payment.invoiceUrl || payment.bankSlipUrl,
    });
  } catch (error: any) {
    console.error("Erro no checkout Asaas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao gerar link de pagamento no Asaas." },
      { status: 500 }
    );
  }
}
