import type { Meta, StoryObj } from "@storybook/react";

import { DEFAULT_ROUTES } from "@/routes";

import { Header } from ".";

const meta: Meta<typeof Header> = {
  title: "Components/Header",
  component: Header,
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
    loginLabel: { control: "text" },
    loginHref: { control: "text" },
    routes: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const CustomLoginLabel: Story = {
  args: {
    loginLabel: "Entrar",
    loginHref: "/auth/login",
  },
};

export const WithActiveRoute: Story = {
  args: {
    routes: DEFAULT_ROUTES.map((r, i) => ({ ...r, active: i === 1 })),
  },
};

export const MinimalNav: Story = {
  args: {
    loginLabel: "Entrar",
    routes: [
      { href: "/", label: "Home" },
      { href: "/pricing", label: "Preços" },
    ],
  },
};

export const CTALabel: Story = {
  args: {
    loginLabel: "Começar grátis →",
    loginHref: "/signup",
  },
};
