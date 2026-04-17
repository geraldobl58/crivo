import { DEFAULT_ROUTES } from "@/routes";

import type { Meta, StoryObj } from "@storybook/react";

import { Navbar } from ".";

const meta: Meta<typeof Navbar> = {
  title: "Components/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
  argTypes: {
    routes: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};

export const WithActiveRoute: Story = {
  args: {
    routes: DEFAULT_ROUTES.map((r, i) => ({ ...r, active: i === 2 })),
  },
};

export const FewRoutes: Story = {
  args: {
    routes: [
      { href: "/", label: "Home" },
      { href: "/pricing", label: "Preços" },
    ],
  },
};

export const CustomRoutes: Story = {
  args: {
    routes: [
      { href: "/", label: "Produto", active: true },
      { href: "/docs", label: "Documentação" },
      { href: "/blog", label: "Blog" },
      { href: "/contato", label: "Contato" },
    ],
  },
};
