import type { Meta, StoryObj } from "@storybook/react";

import { ButtonTop } from ".";

const meta: Meta<typeof ButtonTop> = {
  title: "Components/ButtonTop",
  component: ButtonTop,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ButtonTop>;

export const Default: Story = {};
