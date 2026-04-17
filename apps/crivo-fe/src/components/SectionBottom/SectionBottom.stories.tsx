import type { Meta, StoryObj } from "@storybook/react";

import { SectionBottom } from ".";

const meta: Meta<typeof SectionBottom> = {
  title: "Sections/SectionBottom",
  component: SectionBottom,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SectionBottom>;

/** Exibe os dois cards de comparação lado a lado (desktop) */
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
