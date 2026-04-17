import type { Meta, StoryObj } from "@storybook/react";

import { DEFAULT_ROUTES } from "@/routes";

import { MobileDrawer } from ".";

const meta: Meta<typeof MobileDrawer> = {
  title: "Components/MobileDrawer",
  component: MobileDrawer,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
  args: {
    routes: DEFAULT_ROUTES,
    loginLabel: "Login",
    loginHref: "/login",
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof MobileDrawer>;

export const Open: Story = {
  args: { open: true },
};

export const Closed: Story = {
  args: { open: false },
};

export const CustomLoginLabel: Story = {
  args: {
    open: true,
    loginLabel: "Entrar",
    loginHref: "/auth/login",
  },
};
