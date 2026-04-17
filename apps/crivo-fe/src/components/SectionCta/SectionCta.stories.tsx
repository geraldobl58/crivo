import type { Meta, StoryObj } from "@storybook/react";

import { Zap, ArrowRight } from "lucide-react";

import { SectionCta } from ".";

const meta: Meta<typeof SectionCta> = {
  title: "Sections/SectionCta",
  component: SectionCta,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "fullscreen",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    ctaLabel: { control: "text" },
    ctaHref: { control: "text" },
    ctaIcon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof SectionCta>;

/** Padrão com todos os defaults */
export const Default: Story = {};

/** Título e descrição em português */
export const Portuguese: Story = {
  args: {
    title: "Pronto para automatizar suas finanças?",
    description:
      "Junte-se a centenas de empresas brasileiras que já eliminaram a burocracia com o Crivo.",
    ctaLabel: "Comece seu teste gratuito de 1 dia",
    ctaHref: "/cadastro",
  },
};

/** Sem descrição */
export const NoDescription: Story = {
  args: {
    description: undefined,
    ctaLabel: "Começar agora",
  },
};

/** Com ícone de raio */
export const ZapIcon: Story = {
  args: {
    ctaLabel: "Ativar agora",
    ctaIcon: <Zap size={18} />,
  },
};

/** Com seta no botão */
export const ArrowIcon: Story = {
  args: {
    ctaLabel: "Ver planos",
    ctaHref: "/pricing",
    ctaIcon: <ArrowRight size={18} />,
  },
};

/** Sem ícone no botão */
export const NoIcon: Story = {
  args: {
    ctaLabel: "Falar com vendas",
    ctaHref: "/contact",
    ctaIcon: null,
  },
};
