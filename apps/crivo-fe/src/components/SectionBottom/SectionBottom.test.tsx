import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionBottom } from ".";

describe("SectionBottom", () => {
  it("renders the 'The Old Way' card title", () => {
    render(<SectionBottom />);
    expect(screen.getByText("Bagunçado e manual")).toBeInTheDocument();
  });

  it("renders the 'The Fluxo Way' card title", () => {
    render(<SectionBottom />);
    expect(screen.getByText("Limpo e Automatizado")).toBeInTheDocument();
  });

  it("renders the 'O Jeito Antigo' badge", () => {
    render(<SectionBottom />);
    expect(screen.getByText("O Jeito Antigo")).toBeInTheDocument();
  });

  it("renders the 'O Jeito Novo com o Crivo' badge", () => {
    render(<SectionBottom />);
    expect(screen.getByText("O Jeito Novo com o Crivo")).toBeInTheDocument();
  });

  it("renders all old-way feature items", () => {
    render(<SectionBottom />);
    expect(
      screen.getByText("Planilhas espalhadas por todo lado"),
    ).toBeInTheDocument();
    expect(screen.getByText("E-mails de NFe perdidos")).toBeInTheDocument();
    expect(screen.getByText("Prazos do DAS esquecidos")).toBeInTheDocument();
    expect(screen.getByText("Estresse constante")).toBeInTheDocument();
  });

  it("renders all fluxo-way feature items", () => {
    render(<SectionBottom />);
    expect(screen.getByText("Dashboard centralizado")).toBeInTheDocument();
    expect(
      screen.getByText("NFes buscadas automaticamente"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pagamentos de impostos automatizados"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tranquilidade total")).toBeInTheDocument();
  });

  it("renders exactly two card headings", () => {
    render(<SectionBottom />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  });
});
