"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Erro de Configuração",
    description:
      "Há um problema na configuração do servidor de autenticação. Entre em contato com o suporte.",
  },
  AccessDenied: {
    title: "Acesso Negado",
    description: "Você não tem permissão para acessar este recurso.",
  },
  Verification: {
    title: "Erro de Verificação",
    description:
      "O link de verificação expirou ou já foi utilizado. Tente novamente.",
  },
  Default: {
    title: "Serviço Indisponível",
    description:
      "O serviço de autenticação está temporariamente indisponível. Tente novamente em alguns instantes.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") ?? "Default";
  const { title, description } =
    ERROR_MESSAGES[errorType] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 leading-relaxed">{description}</p>

        <div className="flex flex-col gap-3 pt-2">
          <a
            href="/api/auth/signin"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-colors"
          >
            Tentar Novamente
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 text-white font-semibold text-sm transition-colors"
          >
            Voltar ao Início
          </a>
        </div>

        <p className="text-xs text-gray-600 pt-4">
          Se o problema persistir, entre em contato com{" "}
          <a
            href="mailto:suporte@crivo.com.br"
            className="text-indigo-400 hover:underline"
          >
            suporte@crivo.com.br
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
