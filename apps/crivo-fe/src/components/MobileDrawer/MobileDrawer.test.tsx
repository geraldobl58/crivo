import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileDrawer } from ".";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const routes = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Preços" },
];

describe("MobileDrawer", () => {
  it("renders nav links when open", () => {
    render(<MobileDrawer open onClose={vi.fn()} routes={routes} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Preços")).toBeInTheDocument();
  });

  it("renders the logo when open", () => {
    render(<MobileDrawer open onClose={vi.fn()} routes={routes} />);
    expect(screen.getByText("Crivo")).toBeInTheDocument();
  });

  it("renders the login link", () => {
    render(
      <MobileDrawer
        open
        onClose={vi.fn()}
        routes={routes}
        loginLabel="Login"
      />,
    );
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });

  it("renders custom login label", () => {
    render(
      <MobileDrawer
        open
        onClose={vi.fn()}
        routes={routes}
        loginLabel="Entrar"
        loginHref="/auth/login"
      />,
    );
    const link = screen.getByRole("link", { name: "Entrar" });
    expect(link).toHaveAttribute("href", "/auth/login");
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    render(<MobileDrawer open onClose={onClose} routes={routes} />);
    await userEvent.click(screen.getByTestId("drawer-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<MobileDrawer open onClose={onClose} routes={routes} />);
    await userEvent.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has role dialog when open", () => {
    render(<MobileDrawer open onClose={vi.fn()} routes={routes} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
