// Integração Oficial Asaas (Cobranças via Pix, Boleto e Cartão de Crédito com Parcelamento)

const ASAAS_API_URL =
  process.env.ASAAS_ENVIRONMENT === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

interface CreateCustomerInput {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}

interface CreatePaymentInput {
  customerId: string;
  value: number; // Ex: 490.00
  description: string;
  dueDate: string; // YYYY-MM-DD
  maxInstallmentCount?: number; // Ex: 12
}

export async function asaasRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${ASAAS_API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    access_token: ASAAS_API_KEY,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.errors?.[0]?.description || "Erro na comunicação com o Asaas");
  }

  return data;
}

// 1. Criar ou Buscar Cliente no Asaas
export async function createAsaasCustomer(input: CreateCustomerInput) {
  return asaasRequest("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpfCnpj.replace(/\D/g, ""),
      mobilePhone: input.phone?.replace(/\D/g, ""),
    }),
  });
}

// 2. Gerar Cobrança Flexível (O cliente escolhe Pix ou Cartão em até 12x)
export async function createAsaasPayment(input: CreatePaymentInput) {
  return asaasRequest("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "UNDEFINED", // Permite ao cliente escolher PIX, CARTÃO ou BOLETO
      value: input.value,
      dueDate: input.dueDate,
      description: input.description,
      maxInstallmentCount: input.maxInstallmentCount || 12,
    }),
  });
}

// 3. Obter QR Code Pix de uma cobrança
export async function getAsaasPixQrCode(paymentId: string) {
  return asaasRequest(`/payments/${paymentId}/pixQrCode`, {
    method: "GET",
  });
}
