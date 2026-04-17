import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { Header } from ".";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/hooks/useActiveSection", () => ({
  useActiveSection: () => "",
}));

describe("Header", () => {
  it("renders the logo", () => {
    render(<Header />);
    expect(screen.getAllByText("Crivo").length).toBeGreaterThan(0);
  });

  it("renders default 'Login' label", () => {
    render(<Header />);
    expect(screen.getAllByText("Entrar na Plataforma").length).toBeGreaterThan(
      0,
    );
  });

  it("renders custom login label", () => {
    render(<Header loginLabel="Entrar" />);
    expect(screen.getAllByText("Entrar").length).toBeGreaterThan(0);
    expect(screen.queryByText("Entrar na Plataforma")).not.toBeInTheDocument();
  });

  it("login link points to custom href", () => {
    render(<Header loginHref="/auth/signin" loginLabel="Entrar" />);
    const links = screen
      .getAllByText("Entrar")
      .map((el) => el.closest("a"))
      .filter(Boolean);
    expect(links[0]).toHaveAttribute("href", "/auth/signin");
  });

  it("renders custom navigation routes", () => {
    const routes = [
      { href: "/produto", label: "Produto" },
      { href: "/pricing", label: "Preços" },
    ];
    render(<Header routes={routes} />);
    expect(screen.getAllByText("Produto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Preços").length).toBeGreaterThan(0);
  });

  it("renders as a header landmark", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("shows hamburger button", () => {
    render(<Header />);
    expect(
      screen.getByRole("button", { name: /abrir menu/i }),
    ).toBeInTheDocument();
  });

  it("opens mobile drawer when hamburger is clicked", async () => {
    render(<Header />);
    const button = screen.getByRole("button", { name: /abrir menu/i });
    await userEvent.click(button);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes mobile drawer when close button is clicked", async () => {
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /abrir menu/i }));
    await userEvent.click(screen.getByRole("button", { name: /fechar menu/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
