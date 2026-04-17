import type { Meta, StoryObj } from "@storybook/react";

import { SectionHero } from ".";

const meta: Meta<typeof SectionHero> = {
  title: "Sections/SectionHero",
  component: SectionHero,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
  argTypes: {
    align: { control: "select", options: ["center", "left"] },
    eyebrow: { control: "text" },
    title: { control: "text" },
    titleHighlight: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHero>;

/** Padrão completo com todos os campos */
export const Default: Story = {};

/** Alinhado à esquerda */
export const LeftAligned: Story = {
  args: { align: "left" },
};

/** Com eyebrow acima do título */
export const WithEyebrow: Story = {
  args: {
    eyebrow: "Novidade 2026",
    title: "Financeiro inteligente para",
    titleHighlight: "empresas sem tempo a perder.",
  },
};

/** Sem CTA secundário */
export const PrimaryCtaOnly: Story = {
  args: {
    secondaryCta: undefined,
    primaryCta: { label: "Começar grátis", href: "/signup" },
  },
};

/** Sem nenhum CTA */
export const NoCtas: Story = {
  args: {
    primaryCta: undefined,
    secondaryCta: undefined,
  },
};

/** Apenas título, sem descrição nem CTAs */
export const TitleOnly: Story = {
  args: {
    description: undefined,
    primaryCta: undefined,
    secondaryCta: undefined,
  },
};

/** CTAs personalizados */
export const CustomCtas: Story = {
  args: {
    primaryCta: { label: "Começar grátis", href: "/signup" },
    secondaryCta: { label: "Ver demo", href: "/demo" },
  },
};
