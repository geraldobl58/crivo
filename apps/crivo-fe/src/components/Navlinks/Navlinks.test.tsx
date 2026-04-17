import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { Navlinks } from ".";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Navlinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the label", () => {
    render(<Navlinks href="/home" label="Home" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders the correct href", () => {
    render(<Navlinks href="/pricing" label="Preços" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/pricing");
  });

  it("is active when href matches current pathname", () => {
    // usePathname returns '/' by default in the mock
    render(<Navlinks href="/" label="Home" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("is inactive when href does not match pathname", () => {
    render(<Navlinks href="/other" label="Outro" />);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("aria-current", "page");
  });

  it("respects explicit active=true override", () => {
    render(<Navlinks href="/other" label="Outro" active={true} />);
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("respects explicit active=false override", () => {
    // href matches '/' but active=false forces inactive
    render(<Navlinks href="/" label="Home" active={false} />);
    expect(screen.getByRole("link")).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
