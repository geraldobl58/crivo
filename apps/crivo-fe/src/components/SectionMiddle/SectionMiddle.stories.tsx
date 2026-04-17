import type { Meta, StoryObj } from "@storybook/react";

import { SectionMiddle } from ".";

const meta: Meta<typeof SectionMiddle> = {
  title: "Sections/SectionMiddle",
  component: SectionMiddle,
  tags: ["autodocs"],
  parameters: {
    backgrounds: { default: "dark" },
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SectionMiddle>;

/** Exibe os dois cards lado a lado (desktop) */
export const Default: Story = {};

/** Simula visualização em dispositivo móvel */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};

/** Simula visualização em tablet */
export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};
