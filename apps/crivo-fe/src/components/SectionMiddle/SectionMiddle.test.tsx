import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionMiddle } from ".";

describe("SectionMiddle", () => {
  it("renders the OCR card title", () => {
    render(<SectionMiddle />);
    expect(
      screen.getByText("Extração de dados por IA (OCR)"),
    ).toBeInTheDocument();
  });

  it("renders the analytics card title", () => {
    render(<SectionMiddle />);
    expect(
      screen.getByText("Real time analytics & insights"),
    ).toBeInTheDocument();
  });

  it("renders the OCR card description", () => {
    render(<SectionMiddle />);
    expect(screen.getByText(/modelo OCR especializado/i)).toBeInTheDocument();
  });

  it("renders the analytics card description", () => {
    render(<SectionMiddle />);
    expect(screen.getByText(/insights instantâneos/i)).toBeInTheDocument();
  });

  it("renders OCR accuracy feature item", () => {
    render(<SectionMiddle />);
    expect(
      screen.getByText(/99.9% accuracy on NFe\/NFCe/i),
    ).toBeInTheDocument();
  });

  it("renders OCR categorization feature item", () => {
    render(<SectionMiddle />);
    expect(screen.getByText(/categorization precisa/i)).toBeInTheDocument();
  });

  it("renders OCR fraud detection feature item", () => {
    render(<SectionMiddle />);
    expect(screen.getByText(/Fraud detection built-in/i)).toBeInTheDocument();
  });

  it("renders analytics dashboard feature item", () => {
    render(<SectionMiddle />);
    expect(screen.getByText(/Dashboard customizável/i)).toBeInTheDocument();
  });

  it("renders analytics alertas feature item", () => {
    render(<SectionMiddle />);
    expect(screen.getByText(/Alertas inteligentes/i)).toBeInTheDocument();
  });

  it("renders analytics exportação feature item", () => {
    render(<SectionMiddle />);
    expect(screen.getByText(/Exportação fácil de dados/i)).toBeInTheDocument();
  });

  it("renders exactly two cards", () => {
    render(<SectionMiddle />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  });
});
