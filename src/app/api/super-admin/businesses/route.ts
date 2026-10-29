import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, feedbacks } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const { isSuperAdmin } = await getAuthenticatedUser();
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const allBusinesses = await db.query.businesses.findMany({
      orderBy: [desc(businesses.createdAt)],
    });

    // Pega a contagem de feedbacks de cada empresa
    const enriched = await Promise.all(
      allBusinesses.map(async (b) => {
        const counts = await db
          .select({
            count: sql<number>`count(*)`,
          })
          .from(feedbacks)
          .where(eq(feedbacks.businessId, b.id));

        return {
          ...b,
          feedbackCount: Number(counts[0]?.count || 0),
        };
      })
    );

    return NextResponse.json({ success: true, businesses: enriched });
  } catch (error) {
    console.error("Erro ao listar empresas no Super Admin:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isSuperAdmin } = await getAuthenticatedUser();
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, category, ownerEmail, googleReviewUrl, notificationPhone, paymentStatus } = body;

    if (!name || !slug || !googleReviewUrl || !ownerEmail) {
      return NextResponse.json(
        { error: "Nome, link do Google, slug e e-mail do cliente são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    // Verificar se slug já existe
    const existing = await db.query.businesses.findFirst({
      where: eq(businesses.slug, cleanSlug),
    });

    if (existing) {
      return NextResponse.json(
        { error: `O endereço "${cleanSlug}" já está em uso.` },
        { status: 409 }
      );
    }

    const [newBusiness] = await db
      .insert(businesses)
      .values({
        name: name.trim(),
        slug: cleanSlug,
        category: category?.trim() || "Negócio Local",
        ownerEmail: ownerEmail.toLowerCase().trim(),
        googleReviewUrl: googleReviewUrl.trim(),
        notificationPhone: notificationPhone?.replace(/\D/g, "") || null,
        paymentStatus: paymentStatus || "active",
        coverColor: body.coverColor || "#2563eb",
        isDemo: false,
      })
      .returning();

    return NextResponse.json({ success: true, business: newBusiness });
  } catch (error: any) {
    console.error("Erro ao cadastrar empresa pelo Super Admin:", error);
    return NextResponse.json({ error: error.message || "Erro ao salvar" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { isSuperAdmin } = await getAuthenticatedUser();
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const { id, paymentStatus } = body;

    if (!id || !paymentStatus) {
      return NextResponse.json({ error: "ID e paymentStatus são obrigatórios." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      paymentStatus,
      updatedAt: new Date(),
    };

    // Se o Super Admin mudou manualmente para Teste 7d, reinicia a contagem de 7 dias no relógio do servidor
    if (paymentStatus === "trial") {
      updatePayload.createdAt = new Date();
    }

    const [updated] = await db
      .update(businesses)
      .set(updatePayload)
      .where(eq(businesses.id, id))
      .returning();

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar status." }, { status: 500 });
  }
}
