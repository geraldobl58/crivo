import type { Meta, StoryObj } from "@storybook/react";

import { Title } from ".";

const meta: Meta<typeof Title> = {
  title: "Components/Title",
  component: Title,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "fullscreen",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Title>;

/** Padrão — título e descrição reais do produto */
export const Default: Story = {
  args: {
    title: "Inteligência e Automação",
    description:
      "The Smart part of Fluxo. We use advanced machine learning to handle the heavy lifting of Brazilian tax compliance.",
  },
};

/** Conteúdo curto */
export const ShortContent: Story = {
  args: {
    title: "IA no Financeiro",
    description: "Automatize processos e ganhe produtividade.",
  },
};

/** Título longo */
export const LongTitle: Story = {
  args: {
    title:
      "Automação fiscal inteligente para empresas que não têm tempo a perder",
    description: "Reduza erros e ganhe eficiência com nossa plataforma.",
  },
};

/** Descrição longa */
export const LongDescription: Story = {
  args: {
    title: "Inteligência & Automação",
    description:
      "Nossa plataforma utiliza modelos de machine learning treinados em milhões de documentos fiscais brasileiros para extrair, categorizar e validar dados automaticamente, eliminando tarefas manuais, reduzindo erros humanos e garantindo total conformidade com a legislação tributária vigente.",
  },
};

/** Conteúdo em inglês */
export const EnglishContent: Story = {
  args: {
    title: "Intelligence & Automation",
    description:
      "We use advanced machine learning to handle the heavy lifting of Brazilian tax compliance, so your team can focus on what matters.",
  },
};
