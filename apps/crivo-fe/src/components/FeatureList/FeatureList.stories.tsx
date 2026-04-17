import type { Meta, StoryObj } from "@storybook/react";
import { X, Check, Star } from "lucide-react";

import { FeatureList } from ".";

const meta: Meta<typeof FeatureList> = {
  title: "Components/FeatureList",
  component: FeatureList,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "centered",
  },
  argTypes: {
    iconClassName: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FeatureList>;

/** Check verde-indigo — padrão */
export const Default: Story = {
  args: {
    items: [
      "Transações ilimitadas",
      "OCR avançado com IA",
      "Cálculo automático de impostos",
    ],
  },
};

/** Ícone X vermelho — lista de problemas */
export const DangerList: Story = {
  args: {
    items: ["Planilhas espalhadas", "E-mails perdidos", "Prazos esquecidos"],
    icon: <X size={14} />,
    iconClassName: "text-rose-400",
  },
};

/** Check azul — lista de benefícios */
export const SuccessList: Story = {
  args: {
    items: ["Dashboard centralizado", "NFes automáticas", "Paz total"],
    icon: <Check size={14} />,
    iconClassName: "text-blue-400",
  },
};

/** Ícone customizado */
export const CustomIcon: Story = {
  args: {
    items: ["Feature premium 1", "Feature premium 2", "Feature premium 3"],
    icon: <Star size={14} />,
    iconClassName: "text-yellow-400",
  },
};

/** Lista longa */
export const LongList: Story = {
  args: {
    items: [
      "Tudo do Professional",
      "Integrações personalizadas",
      "Gerente de conta dedicado",
      "SLA garantido",
      "Suporte 24/7",
      "Onboarding assistido",
    ],
  },
};
