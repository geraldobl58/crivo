import { ArrowRight, Calculator, Play } from "lucide-react";
import Link from "next/link";
import { FaRobot, FaWhatsapp } from "react-icons/fa";

import { Card } from "../Card";
import type { CardVariant } from "../Card";
import { HeroAnimation } from "./HeroAnimation";

type FeatureCard = {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: CardVariant;
  badge?: string;
};

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: <FaRobot className="text-blue-400" size={26} />,
    title: "Documentos analisados com IA",
    description:
      "Extraia dados automaticamente de recibos e faturas com 99,9% de precisão.",
  },
  {
    icon: <Calculator className="text-indigo-200" size={26} />,
    title: "Cálculos automatizados",
    description:
      "Realize cálculos complexos automaticamente com precisão e rapidez.",
    variant: "highlighted",
    badge: "Mais usado",
  },
  {
    icon: <FaWhatsapp className="text-green-500" size={26} />,
    title: "Whatsapp integrado",
    description:
      "Envie mensagens automaticamente pelo Whatsapp com facilidade e rapidez.",
  },
];

export type CtaButton = {
  label: string;
  href: string;
};

export type SectionHeroProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  primaryCta?: CtaButton;
  secondaryCta?: CtaButton;
  align?: "center" | "left";
};

export const SectionHero = ({
  id,
  eyebrow,
  title = "Financeiro inteligente para",
  titleHighlight = "empresas sem tempo a perder.",
  description,
  primaryCta,
  secondaryCta,
  align = "center",
}: SectionHeroProps) => {
  const alignClass =
    align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <>
      <section
        id={id}
        className={`w-full max-w-7xl mx-auto flex flex-col ${alignClass} justify-center gap-12 py-14 px-4`}
      >
        <div>
          {eyebrow && (
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-900/40 px-3 py-1 rounded-full">
              {eyebrow}
            </span>
          )}
          {title && (
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-400">
              {title}
            </h1>
          )}
          {titleHighlight && (
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-indigo-400">
              {titleHighlight}
            </h1>
          )}
        </div>

        <div
          className={`max-w-3xl ${align === "center" ? "mx-auto" : ""} space-y-12`}
        >
          {description && (
            <p
              className={`text-lg text-gray-300 ${align === "center" ? "text-center" : ""}`}
            >
              {description}
            </p>
          )}

          {(primaryCta || secondaryCta) && (
            <div
              className={`flex flex-wrap gap-4 ${align === "center" ? "justify-center" : ""}`}
            >
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="bg-indigo-600 text-white font-bold px-6 py-4 rounded-md hover:bg-indigo-700 transition-colors shadow-blue-600 shadow-xs"
                >
                  {primaryCta.label}
                  <ArrowRight className="inline-block ml-2" size={16} />
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="bg-black text-white font-bold px-6 py-4 rounded-md hover:bg-white/10 transition-colors shadow-gray-600 shadow-xs"
                >
                  {secondaryCta.label}{" "}
                  <Play className="inline-block ml-2" size={16} />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <HeroAnimation />

      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-4 pb-20">
        {FEATURE_CARDS.map((card) => (
          <Card
            key={card.title}
            icon={card.icon}
            title={card.title}
            description={card.description}
            variant={card.variant}
            badge={card.badge}
          />
        ))}
      </div>
    </>
  );
};
