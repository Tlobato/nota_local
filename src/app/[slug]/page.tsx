import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ReviewFlow from "@/components/ReviewFlow";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
  });

  if (!business) {
    return {
      title: "Estabelecimento não encontrado | NotaLocal",
    };
  }

  return {
    title: `Avalie seu atendimento - ${business.name}`,
    description: `Deixe sua avaliação sobre a experiência na ${business.name}.`,
  };
}

export default async function BusinessReviewPage({ params }: PageProps) {
  const { slug } = await params;

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
  });

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <ReviewFlow business={business} />

        {/* Rodapé institucional discreto */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>
            Plataforma de Reputação & Atendimento{" "}
            <span className="font-semibold text-slate-500">NotaLocal</span>
          </p>
        </div>
      </div>
    </main>
  );
}
