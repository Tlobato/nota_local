import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  showRatingBadge?: boolean;
  href?: string;
}

export default function Logo({
  variant = "dark",
  showRatingBadge = true,
  href = "/",
}: LogoProps) {
  const isLight = variant === "light";

  const content = (
    <div className="flex items-center gap-2.5 group">
      {/* Ícone: Pin de Localização do Google Maps com Estrela Dourada dentro */}
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/25 border border-white/10 shrink-0 transition-transform group-hover:scale-105 duration-200">
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pin de Localização */}
          <path
            d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z"
            className="fill-blue-900/60 stroke-white stroke-[1.8]"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Estrela de Avaliação 5 Estrelas */}
          <path
            d="M12 5.8L13.1 8.1L15.6 8.4L13.8 10.1L14.2 12.6L12 11.4L9.8 12.6L10.2 10.1L8.4 8.4L10.9 8.1L12 5.8Z"
            className="fill-amber-400 stroke-amber-300 stroke-[0.8]"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Tipografia da Marca */}
      <div className="flex items-center gap-2">
        <span
          className={`font-black text-xl tracking-tight transition-colors ${
            isLight ? "text-slate-900" : "text-white"
          }`}
        >
          Nota<span className="text-blue-500 font-extrabold">Local</span>
        </span>

        {/* Selo Visual de 5 Estrelas */}
        {showRatingBadge && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-bold text-amber-400 tracking-wide select-none">
            <span>5.0</span>
            <span className="text-amber-400 text-xs leading-none">★★★★★</span>
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
