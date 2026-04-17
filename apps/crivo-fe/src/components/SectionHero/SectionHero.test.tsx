import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionHero } from ".";

describe("SectionHero", () => {
  it("renders default title and highlight", () => {
    render(<SectionHero />);
    expect(screen.getByText("Financeiro inteligente para")).toBeInTheDocument();
    expect(
      screen.getByText("empresas sem tempo a perder."),
    ).toBeInTheDocument();
  });

  it("renders custom title and titleHighlight", () => {
    render(
      <SectionHero
        title="Título customizado"
        titleHighlight="Destaque customizado"
      />,
    );
    expect(screen.getByText("Título customizado")).toBeInTheDocument();
    expect(screen.getByText("Destaque customizado")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<SectionHero description="Descrição personalizada." />);
    expect(screen.getByText("Descrição personalizada.")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    render(<SectionHero />);
    expect(screen.queryByText(/Elimine a burocracia/i)).not.toBeInTheDocument();
  });

  it("renders eyebrow when provided", () => {
    render(<SectionHero eyebrow="Novidade 2026" />);
    expect(screen.getByText("Novidade 2026")).toBeInTheDocument();
  });

  it("does not render eyebrow when omitted", () => {
    render(<SectionHero />);
    expect(screen.queryByText("Novidade 2026")).not.toBeInTheDocument();
  });

  it("renders the primary CTA", () => {
    render(<SectionHero primaryCta={{ label: "Começar", href: "/signup" }} />);
    expect(screen.getByRole("link", { name: /começar/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("renders the secondary CTA", () => {
    render(<SectionHero secondaryCta={{ label: "Ver demo", href: "/demo" }} />);
    expect(screen.getByRole("link", { name: /ver demo/i })).toHaveAttribute(
      "href",
      "/demo",
    );
  });

  it("does not render secondary CTA when omitted", () => {
    render(<SectionHero />);
    expect(
      screen.queryByRole("link", { name: /saiba mais/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render any CTA when both are omitted", () => {
    render(<SectionHero />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
