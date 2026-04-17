import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { FooterLinks } from ".";

describe("FooterLinks", () => {
  it("renders the logo", () => {
    render(<FooterLinks />);
    expect(screen.getByText("Crivo")).toBeInTheDocument();
  });

  it("renders the default tagline", () => {
    render(<FooterLinks />);
    expect(screen.getByText(/inteligentes/i)).toBeInTheDocument();
  });

  it("renders a custom tagline", () => {
    render(<FooterLinks tagline="Tagline customizada" />);
    expect(screen.getByText("Tagline customizada")).toBeInTheDocument();
  });

  it("renders all column headings by default", () => {
    render(<FooterLinks />);
    expect(screen.getByText("Produto")).toBeInTheDocument();
    expect(screen.getByText("Recursos")).toBeInTheDocument();
    expect(screen.getByText("Empresa")).toBeInTheDocument();
  });

  it("renders link labels inside columns", () => {
    render(<FooterLinks />);
    expect(screen.getByText("Funcionalidades")).toBeInTheDocument();
    expect(screen.getByText("Documentação")).toBeInTheDocument();
    expect(screen.getByText("Sobre")).toBeInTheDocument();
  });

  it("renders social media links", () => {
    render(<FooterLinks />);
    expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
  });

  it("renders custom columns", () => {
    render(
      <FooterLinks
        columns={[
          {
            heading: "Customizado",
            links: [{ href: "/custom", label: "Link Custom" }],
          },
        ]}
      />,
    );
    expect(screen.getByText("Customizado")).toBeInTheDocument();
    expect(screen.getByText("Link Custom")).toBeInTheDocument();
  });
});
