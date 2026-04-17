import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { Footer } from ".";

describe("Footer", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it("renders the footer landmark", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the logo inside footer", () => {
    render(<Footer />);
    expect(screen.getByText("Crivo")).toBeInTheDocument();
  });

  it("renders column headings", () => {
    render(<Footer />);
    expect(screen.getByText("Produto")).toBeInTheDocument();
    expect(screen.getByText("Recursos")).toBeInTheDocument();
    expect(screen.getByText("Empresa")).toBeInTheDocument();
  });

  it("renders the back-to-top button", () => {
    render(<Footer />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
