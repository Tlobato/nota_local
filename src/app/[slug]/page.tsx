import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ReviewFlow from "@/components/ReviewFlow";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Deduplica a consulta no banco entre generateMetadata e a renderização da página (reduz o tempo de resposta pela metade)
const getBusinessBySlug = cache(async (slug: string) => {
  return db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
  });
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

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

  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  // Verifica se está bloqueado por pagamento pendente ou fim dos 7 dias de teste grátis (usando relógio do servidor e createdAt imutável pelo cliente)
  const refDate = new Date(business.createdAt);
  const daysElapsed = Math.floor((Date.now() - refDate.getTime()) / (1000 * 60 * 60 * 24));
  const isTrialExpired = business.paymentStatus === "trial" && daysElapsed >= 7;
  const isBlocked = !business.isDemo && (business.paymentStatus === "pending" || isTrialExpired);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {isBlocked ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Canal Temporariamente Pausado
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              A página de avaliações de <strong>{business.name}</strong> aguarda ativação do plano pelo responsável do estabelecimento.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                <span>Sou o Gestor: Ativar Meu Plano</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <ReviewFlow business={business} />
        )}

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
