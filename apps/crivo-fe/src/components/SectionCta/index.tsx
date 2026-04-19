import Link from "next/link";

import { Rocket } from "lucide-react";

export type SectionCtaProps = {
  id?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaIcon?: React.ReactNode;
};

export const SectionCta = ({
  id,
  title = "Pronto para modernizar suas operações financeiras?",
  description = "Junte-se a centenas de empresas brasileiras modernas que usam o Crivo para automatizar sua rotina e focar no crescimento.",
  ctaLabel = "Comece seu teste grátis agora",
  ctaHref = "/signup",
  ctaIcon = <Rocket size={18} />,
}: SectionCtaProps) => {
  return (
    <section id={id} className="py-20 px-4">
      <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#0f1130] border border-white/[0.08] shadow-[0_0_80px_0_rgba(68,76,231,0.15)] px-8 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-10">
            {description}
          </p>
        )}
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold px-8 py-4 rounded-full transition-colors duration-200"
        >
          {ctaLabel}
          {ctaIcon}
        </Link>
      </div>
    </section>
  );
};
