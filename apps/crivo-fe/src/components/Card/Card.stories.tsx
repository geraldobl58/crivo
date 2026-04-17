import type { Meta, StoryObj } from "@storybook/react";
import {
  Calculator,
  ArrowRight,
  Check,
  X,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";
import { FaRobot, FaWhatsapp } from "react-icons/fa";

import { Card } from ".";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "highlighted", "danger"],
    },
    badgeVariant: {
      control: "select",
      options: ["default", "success", "danger"],
    },
    badge: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

/** Ícone + título + descrição */
export const Default: Story = {
  args: {
    icon: <FaRobot className="text-blue-400" size={26} />,
    title: "Documentos analisados com IA",
    description:
      "Extraia dados automaticamente de recibos e faturas com 99,9% de precisão.",
  },
};

/** Sem ícone — apenas título e descrição */
export const NoIcon: Story = {
  args: {
    title: "Cálculos automatizados",
    description:
      "Realize cálculos complexos automaticamente com precisão e rapidez.",
  },
};

/** Apenas título, sem descrição nem ícone */
export const TitleOnly: Story = {
  args: {
    title: "Whatsapp integrado",
  },
};

/** Com badge acima do título */
export const WithBadge: Story = {
  args: {
    badge: "Novo",
    icon: <Calculator className="text-indigo-200" size={26} />,
    title: "Cálculos automatizados",
    description: "Realize cálculos complexos automaticamente.",
  },
};

/** Com rodapé customizado (ex.: link CTA) */
export const WithFooter: Story = {
  args: {
    icon: <FaWhatsapp className="text-green-500" size={26} />,
    title: "Whatsapp integrado",
    description: "Envie mensagens automaticamente pelo Whatsapp.",
    footer: (
      <a
        href="#"
        className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
      >
        Saiba mais <ArrowRight size={14} />
      </a>
    ),
  },
};

/** Variante highlighted — borda indigo permanente */
export const Highlighted: Story = {
  args: {
    variant: "highlighted",
    icon: <FaRobot className="text-blue-400" size={26} />,
    title: "Documentos analisados com IA",
    description: "Extraia dados automaticamente com 99,9% de precisão.",
  },
};

/** Highlighted + badge + footer */
export const HighlightedFull: Story = {
  args: {
    variant: "highlighted",
    badge: "Destaque",
    icon: <Calculator className="text-indigo-200" size={26} />,
    title: "Tudo em um só lugar",
    description: "Gerencie NFe, DAS e impostos numa única plataforma.",
    footer: (
      <a
        href="#"
        className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
      >
        Começar grátis <ArrowRight size={14} />
      </a>
    ),
  },
};

/** Variante danger — borda rose, badge vermelho com ícone X */
export const Danger: Story = {
  args: {
    variant: "danger",
    badge: "The Old Way",
    badgeVariant: "danger",
    badgeIcon: <X size={12} />,
    topRightIcon: <FolderOpen size={80} className="text-rose-700" />,
    title: "Bagunçado e manual",
    content: (
      <div className="space-y-3 text-sm text-gray-300">
        <p className="flex items-center gap-2">
          <X size={14} className="text-rose-400 shrink-0" /> Planilhas
          espalhadas por todo lado
        </p>
        <p className="flex items-center gap-2">
          <X size={14} className="text-rose-400 shrink-0" /> Lost NFe emails
        </p>
        <p className="flex items-center gap-2">
          <X size={14} className="text-rose-400 shrink-0" /> Missed DAS
          deadlines
        </p>
        <p className="flex items-center gap-2">
          <X size={14} className="text-rose-400 shrink-0" /> Constant stress
        </p>
      </div>
    ),
  },
};

/** A forma Fluxo — badge azul com ícone check, topRightIcon */
export const TheFluxoWay: Story = {
  args: {
    variant: "highlighted",
    badge: "The Fluxo Way",
    badgeVariant: "success",
    badgeIcon: <Check size={12} />,
    topRightIcon: <ShieldCheck size={80} className="text-indigo-500" />,
    title: "Clean & Automated",
    content: (
      <div className="space-y-3 text-sm text-gray-300">
        <p className="flex items-center gap-2">
          <Check size={14} className="text-blue-400 shrink-0" /> Centralized
          dashboard
        </p>
        <p className="flex items-center gap-2">
          <Check size={14} className="text-blue-400 shrink-0" /> Auto-fetched
          NFes
        </p>
        <p className="flex items-center gap-2">
          <Check size={14} className="text-blue-400 shrink-0" /> Automated tax
          payments
        </p>
        <p className="flex items-center gap-2">
          <Check size={14} className="text-blue-400 shrink-0" /> Peace of mind
        </p>
      </div>
    ),
  },
};

/** Badge variant success sem ícone */
export const BadgeSuccess: Story = {
  args: {
    badge: "Recomendado",
    badgeVariant: "success",
    title: "Plano Pro",
    description: "Tudo que sua empresa precisa para crescer.",
  },
};

/** Badge variant danger sem ícone */
export const BadgeDanger: Story = {
  args: {
    badge: "Depreciado",
    badgeVariant: "danger",
    title: "Plano Legado",
    description: "Este plano não receberá mais atualizações.",
  },
};

/** topRightIcon sem badge */
export const WithTopRightIcon: Story = {
  args: {
    topRightIcon: <ShieldCheck size={80} className="text-indigo-400" />,
    title: "Segurança avançada",
    description: "Seus dados protegidos com criptografia de ponta.",
  },
};
