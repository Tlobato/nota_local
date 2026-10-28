import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prospects } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProspects = await db.query.prospects.findMany({
      orderBy: [desc(prospects.createdAt)],
    });
    return NextResponse.json({ success: true, prospects: allProspects });
  } catch (error) {
    console.error("Erro ao listar prospectos:", error);
    return NextResponse.json({ error: "Erro ao buscar prospectos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      category,
      city,
      contactName,
      phone,
      email,
      instagramOrSite,
      googleUrl,
      googleRating,
      googleReviewsCount,
      status,
      channel,
      notes,
      nextFollowUpDate,
    } = body;

    if (!businessName || !businessName.trim()) {
      return NextResponse.json(
        { error: "O nome da empresa é obrigatório." },
        { status: 400 }
      );
    }

    const isContacted = status && status !== "mapped";

    const [created] = await db
      .insert(prospects)
      .values({
        businessName: businessName.trim(),
        category: category?.trim() || "Negócio Local",
        city: city?.trim() || null,
        contactName: contactName?.trim() || null,
        phone: phone?.replace(/\D/g, "") || null,
        email: email?.toLowerCase().trim() || null,
        instagramOrSite: instagramOrSite?.trim() || null,
        googleUrl: googleUrl?.trim() || null,
        googleRating: googleRating?.trim() || null,
        googleReviewsCount: googleReviewsCount ? Number(googleReviewsCount) : null,
        status: status || "mapped",
        channel: channel || "whatsapp",
        notes: notes?.trim() || null,
        lastContactAt: isContacted ? new Date() : null,
        nextFollowUpDate: nextFollowUpDate || null,
      })
      .returning();

    return NextResponse.json({ success: true, prospect: created });
  } catch (error: any) {
    console.error("Erro ao cadastrar prospecto:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao cadastrar prospecto" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do prospecto é obrigatório." }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (updates.businessName !== undefined) updatePayload.businessName = updates.businessName.trim();
    if (updates.category !== undefined) updatePayload.category = updates.category?.trim() || "Negócio Local";
    if (updates.city !== undefined) updatePayload.city = updates.city?.trim() || null;
    if (updates.contactName !== undefined) updatePayload.contactName = updates.contactName?.trim() || null;
    if (updates.phone !== undefined) updatePayload.phone = updates.phone ? updates.phone.replace(/\D/g, "") : null;
    if (updates.email !== undefined) updatePayload.email = updates.email ? updates.email.toLowerCase().trim() : null;
    if (updates.instagramOrSite !== undefined) updatePayload.instagramOrSite = updates.instagramOrSite?.trim() || null;
    if (updates.googleUrl !== undefined) updatePayload.googleUrl = updates.googleUrl?.trim() || null;
    if (updates.googleRating !== undefined) updatePayload.googleRating = updates.googleRating?.trim() || null;
    if (updates.googleReviewsCount !== undefined) {
      updatePayload.googleReviewsCount = updates.googleReviewsCount !== "" && updates.googleReviewsCount !== null
        ? Number(updates.googleReviewsCount)
        : null;
    }
    if (updates.status !== undefined) {
      updatePayload.status = updates.status;
      if (updates.status !== "mapped") {
        updatePayload.lastContactAt = new Date();
      }
    }
    if (updates.channel !== undefined) updatePayload.channel = updates.channel;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes?.trim() || null;
    if (updates.nextFollowUpDate !== undefined) updatePayload.nextFollowUpDate = updates.nextFollowUpDate || null;
    if (updates.markContactedToday) {
      updatePayload.lastContactAt = new Date();
    }

    const [updated] = await db
      .update(prospects)
      .set(updatePayload)
      .where(eq(prospects.id, id))
      .returning();

    return NextResponse.json({ success: true, prospect: updated });
  } catch (error: any) {
    console.error("Erro ao atualizar prospecto:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar prospecto" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await db.delete(prospects).where(eq(prospects.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir prospecto:", error);
    return NextResponse.json({ error: "Erro ao excluir prospecto" }, { status: 500 });
  }
}
