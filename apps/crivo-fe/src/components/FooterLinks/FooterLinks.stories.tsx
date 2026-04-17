import type { Meta, StoryObj } from "@storybook/react";

import { FooterLinks } from ".";

const meta: Meta<typeof FooterLinks> = {
  title: "Components/FooterLinks",
  component: FooterLinks,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof FooterLinks>;

export const Default: Story = {};

export const CustomTagline: Story = {
  args: {
    tagline: "Sua plataforma financeira inteligente.",
  },
};

export const CustomColumns: Story = {
  args: {
    columns: [
      {
        heading: "Produto",
        links: [
          { href: "/features", label: "Funcionalidades" },
          { href: "/pricing", label: "Preços" },
        ],
      },
      {
        heading: "Empresa",
        links: [
          { href: "/about", label: "Sobre" },
          { href: "/contact", label: "Contato" },
        ],
      },
    ],
  },
};
