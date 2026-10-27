import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

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

    // Verificar se o slug já existe
    const existing = await db.query.businesses.findFirst({
      where: eq(businesses.slug, cleanSlug),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este endereço (slug) já está em uso. Por favor, escolha outro." },
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
        googleReviewUrl: googleReviewUrl.trim(),
        notificationPhone: notificationPhone?.replace(/\D/g, "") || null,
        coverColor: coverColor || "#2563eb",
        paymentStatus: "active",
      })
      .returning();

    return NextResponse.json({ success: true, business: newBusiness });
  } catch (error) {
    console.error("Erro ao criar empresa no onboarding:", error);
    return NextResponse.json({ error: "Erro interno ao cadastrar empresa." }, { status: 500 });
  }
}
