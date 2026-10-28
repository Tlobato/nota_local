import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();

    const body = await req.json();
    const { name, slug, category, googleReviewUrl, notificationPhone, coverColor } = body;

    if (!name || !slug || !googleReviewUrl) {
      return NextResponse.json(
        { error: "Nome, link do Google e endereço (slug) são obrigatórios." },
        { status: 400 }
      );
    }

    // Sanitizar slug (remover caracteres especiais e espaços)
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const cleanGoogleUrl = googleReviewUrl.trim().replace(/\/+$/, "");
    const cleanPhone = notificationPhone?.replace(/\D/g, "") || null;

    // 1. Verificar se o slug já existe
    const existingSlug = await db.query.businesses.findFirst({
      where: eq(businesses.slug, cleanSlug),
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Este endereço (slug) já está em uso. Por favor, escolha outro." },
        { status: 409 }
      );
    }

    // 2. Trava Anti-Abuso dos 7 Dias Grátis: impedir recriação com outro e-mail usando o mesmo Link do Google ou mesmo WhatsApp
    const duplicateConditions = [
      eq(businesses.googleReviewUrl, cleanGoogleUrl),
      eq(businesses.googleReviewUrl, `${cleanGoogleUrl}/`),
    ];
    if (cleanPhone && cleanPhone.length >= 10) {
      duplicateConditions.push(eq(businesses.notificationPhone, cleanPhone));
    }

    const existingBusiness = await db.query.businesses.findFirst({
      where: or(...duplicateConditions),
    });

    if (existingBusiness && !existingBusiness.isDemo) {
      return NextResponse.json(
        {
          error:
            "Este estabelecimento (Link do Google ou WhatsApp) já utilizou o período de teste gratuito de 7 dias. Faça login na sua conta original para ativar seu plano.",
        },
        { status: 409 }
      );
    }

    const [newBusiness] = await db
      .insert(businesses)
      .values({
        ownerId: userId || null,
        ownerEmail: userEmail || null,
        name: name.trim(),
        slug: cleanSlug,
        category: category?.trim() || "Negócio Local",
        googleReviewUrl: cleanGoogleUrl,
        notificationPhone: cleanPhone,
        coverColor: coverColor || "#2563eb",
        paymentStatus: "trial",
      })
      .returning();

    return NextResponse.json({ success: true, business: newBusiness });
  } catch (error) {
    console.error("Erro ao criar empresa no onboarding:", error);
    return NextResponse.json({ error: "Erro interno ao cadastrar empresa." }, { status: 500 });
  }
}
