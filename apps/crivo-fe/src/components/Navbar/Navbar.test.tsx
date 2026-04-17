import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Navbar } from ".";
import { DEFAULT_ROUTES } from "@/routes";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Navbar", () => {
  it("renders default routes", () => {
    render(<Navbar />);
    DEFAULT_ROUTES.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("renders custom routes", () => {
    const routes = [
      { href: "/produto", label: "Produto" },
      { href: "/blog", label: "Blog" },
    ];
    render(<Navbar routes={routes} />);
    expect(screen.getByText("Produto")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("does not render default routes when custom routes are provided", () => {
    const routes = [{ href: "/produto", label: "Produto" }];
    render(<Navbar routes={routes} />);
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });

  it("renders correct number of links", () => {
    const routes = Array.from({ length: 3 }, (_, i) => ({
      href: `/page-${i}`,
      label: `Page ${i}`,
    }));
    render(<Navbar routes={routes} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("has accessible nav landmark", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
