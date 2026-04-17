import type { Meta, StoryObj } from "@storybook/react";

import { Navlinks } from ".";

const meta: Meta<typeof Navlinks> = {
  title: "Components/Navlinks",
  component: Navlinks,
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
    href: { control: "text" },
    label: { control: "text" },
    active: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Navlinks>;

export const Default: Story = {
  args: {
    href: "/home",
    label: "Home",
  },
};

export const Active: Story = {
  args: {
    href: "/home",
    label: "Home",
    active: true,
  },
};

export const Inactive: Story = {
  args: {
    href: "/other",
    label: "Como funciona",
    active: false,
  },
};

export const LongLabel: Story = {
  args: {
    href: "/intelligence",
    label: "Inteligência Artificial",
    active: false,
  },
};
