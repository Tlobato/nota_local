import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NotaLocal | Blindagem e Reputação no Google Meu Negócio",
  description: "Multiplique avaliações 5 estrelas no Google Maps e retenha críticas internamente com inteligência.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
