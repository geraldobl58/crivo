import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { SectionCta } from ".";

describe("SectionCta", () => {
  it("renders the default title", () => {
    render(<SectionCta />);
    expect(
      screen.getByText(/Pronto para modernizar suas operações financeiras?/i),
    ).toBeInTheDocument();
  });

  it("renders a custom title", () => {
    render(<SectionCta title="Título customizado" />);
    expect(screen.getByText("Título customizado")).toBeInTheDocument();
  });

  it("renders the default description", () => {
    render(<SectionCta />);
    expect(
      screen.getByText(
        /Junte-se a centenas de empresas brasileiras modernas que usam o Crivo para automatizar sua rotina e focar no crescimento./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders a custom description", () => {
    render(<SectionCta description="Descrição personalizada da CTA." />);
    expect(
      screen.getByText("Descrição personalizada da CTA."),
    ).toBeInTheDocument();
  });

  it("does not render description when empty string", () => {
    render(<SectionCta description="" />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("renders the CTA link with default label", () => {
    render(<SectionCta />);
    expect(
      screen.getByRole("link", {
        name: /Comece seu teste gratuito de 1 dia/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the CTA link with a custom label", () => {
    render(<SectionCta ctaLabel="Começar agora" />);
    expect(
      screen.getByRole("link", { name: /começar agora/i }),
    ).toBeInTheDocument();
  });

  it("CTA link points to the default href", () => {
    render(<SectionCta />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/signup");
  });

  it("CTA link points to a custom href", () => {
    render(<SectionCta ctaHref="/cadastro" ctaLabel="Cadastrar" />);
    expect(screen.getByRole("link", { name: /cadastrar/i })).toHaveAttribute(
      "href",
      "/cadastro",
    );
  });

  it("renders the section with an id when provided", () => {
    render(<SectionCta id="cta-section" />);
    expect(document.getElementById("cta-section")).toBeInTheDocument();
  });

  it("renders a custom icon", () => {
    render(<SectionCta ctaIcon={<svg data-testid="custom-icon" />} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders without icon when ctaIcon is null", () => {
    render(<SectionCta ctaIcon={null} />);
    // link still renders without an svg inside
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
