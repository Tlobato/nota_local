import { SignUp } from "@clerk/nextjs";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function SignUpPage() {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="mb-8">
        <Logo variant="dark" showRatingBadge={false} />
      </div>

      {hasClerk ? (
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-2xl rounded-3xl border border-slate-100",
            },
          }}
        />
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center text-slate-800 space-y-4">
          <h2 className="text-xl font-bold">Cadastro de Empresa Pronto</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Para ativar o cadastro de novas contas, adicione suas chaves do Clerk no painel da Vercel ou no arquivo <code>.env.local</code>.
          </p>
          <div className="pt-2">
            <Link
              href="/onboarding"
              className="inline-block w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
            >
              Ir para Configuração do Estabelecimento
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
