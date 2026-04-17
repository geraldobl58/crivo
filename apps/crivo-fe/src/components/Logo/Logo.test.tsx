import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Logo } from ".";

describe("Logo", () => {
  it("renders default title 'Crivo'", () => {
    render(<Logo />);
    expect(screen.getByText("Crivo")).toBeInTheDocument();
  });

  it("renders a custom title", () => {
    render(<Logo title="Minha Empresa" />);
    expect(screen.getByText("Minha Empresa")).toBeInTheDocument();
  });

  it("renders an icon when provided", () => {
    render(<Logo icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("does not render an icon when omitted", () => {
    render(<Logo title="Crivo" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("links to home (/)", () => {
    render(<Logo />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
  });
});
