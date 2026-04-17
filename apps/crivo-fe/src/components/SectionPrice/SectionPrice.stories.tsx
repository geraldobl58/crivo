import type { Meta, StoryObj } from "@storybook/react";

import { SectionPrice } from ".";

const meta: Meta<typeof SectionPrice> = {
  title: "Sections/SectionPrice",
  component: SectionPrice,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SectionPrice>;

/** Seção de preços com três planos */
export const Default: Story = {};

/** Visualização mobile */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

/** Visualização tablet */
export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};
