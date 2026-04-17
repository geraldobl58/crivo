import type { Meta, StoryObj } from "@storybook/react";
import { Zap, Bolt, Star } from "lucide-react";

import { Logo } from ".";

const meta: Meta<typeof Logo> = {
  title: "Components/Logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "centered",
  },
  argTypes: {
    title: { control: "text" },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {
    icon: <Zap size={32} className="text-white" />,
  },
};

export const CustomTitle: Story = {
  args: {
    icon: <Zap size={32} className="text-white" />,
    title: "Minha Empresa",
  },
};

export const WithBoltIcon: Story = {
  args: {
    icon: <Bolt size={32} className="text-white" />,
    title: "Crivo",
  },
};

export const WithStarIcon: Story = {
  args: {
    icon: <Star size={32} className="text-yellow-400" />,
    title: "Crivo",
  },
};

export const TextOnly: Story = {
  args: {
    title: "Crivo",
  },
};

export const IconOnly: Story = {
  args: {
    icon: <Zap size={32} className="text-white" />,
  },
};
