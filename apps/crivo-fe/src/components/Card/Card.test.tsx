import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from ".";

describe("Card", () => {
  it("renders the title", () => {
    render(<Card title="Título do Card" />);
    expect(screen.getByText("Título do Card")).toBeInTheDocument();
  });

  it("renders title as heading", () => {
    render(<Card title="Título do Card" />);
    expect(
      screen.getByRole("heading", { name: "Título do Card" }),
    ).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<Card title="Título" description="Descrição detalhada." />);
    expect(screen.getByText("Descrição detalhada.")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    render(<Card title="Título" />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("renders the icon when provided", () => {
    render(
      <Card icon={<span data-testid="card-icon">icon</span>} title="Título" />,
    );
    expect(screen.getByTestId("card-icon")).toBeInTheDocument();
  });

  it("does not render icon wrapper when icon is omitted", () => {
    render(<Card title="Título" />);
    expect(screen.queryByTestId("card-icon")).not.toBeInTheDocument();
  });

  it("renders badge when provided", () => {
    render(<Card title="Título" badge="Novo" />);
    expect(screen.getByText("Novo")).toBeInTheDocument();
  });

  it("does not render badge when omitted", () => {
    render(<Card title="Título" />);
    expect(screen.queryByText("Novo")).not.toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    render(<Card title="Título" footer={<a href="#">Saiba mais</a>} />);
    expect(
      screen.getByRole("link", { name: "Saiba mais" }),
    ).toBeInTheDocument();
  });

  it("applies highlighted variant class", () => {
    render(<Card title="Título" variant="highlighted" />);
    expect(
      screen.getByRole("heading").closest(".border-indigo-500"),
    ).toBeInTheDocument();
  });

  it("applies danger variant class", () => {
    render(<Card title="Título" variant="danger" />);
    expect(
      screen.getByRole("heading").closest(".border-rose-900"),
    ).toBeInTheDocument();
  });

  it("applies default badge variant styles", () => {
    render(<Card title="Título" badge="Novo" />);
    expect(screen.getByText("Novo")).toHaveClass("text-indigo-400");
  });

  it("applies success badge variant styles", () => {
    render(<Card title="Título" badge="Recomendado" badgeVariant="success" />);
    expect(screen.getByText("Recomendado")).toHaveClass("text-blue-400");
  });

  it("applies danger badge variant styles", () => {
    render(<Card title="Título" badge="Depreciado" badgeVariant="danger" />);
    expect(screen.getByText("Depreciado")).toHaveClass("text-rose-400");
  });

  it("renders badgeIcon inside the badge", () => {
    render(
      <Card
        title="Título"
        badge="The Old Way"
        badgeIcon={<span data-testid="badge-icon">x</span>}
      />,
    );
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
  });

  it("renders topRightIcon when provided", () => {
    render(
      <Card
        title="Título"
        topRightIcon={<span data-testid="top-right-icon">bg</span>}
      />,
    );
    expect(screen.getByTestId("top-right-icon")).toBeInTheDocument();
  });

  it("does not render topRightIcon when omitted", () => {
    render(<Card title="Título" />);
    expect(screen.queryByTestId("top-right-icon")).not.toBeInTheDocument();
  });

  it("renders content when provided", () => {
    render(
      <Card
        title="Título"
        content={<p data-testid="card-content">Conteúdo extra</p>}
      />,
    );
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("does not render content when omitted", () => {
    render(<Card title="Título" />);
    expect(screen.queryByTestId("card-content")).not.toBeInTheDocument();
  });

  it("renders price when provided", () => {
    render(<Card title="Título" price="R$ 99" />);
    expect(screen.getByText("R$ 99")).toBeInTheDocument();
  });

  it("does not render price when omitted", () => {
    render(<Card title="Título" />);
    expect(screen.queryByText("R$ 99")).not.toBeInTheDocument();
  });

  it("renders priceSuffix alongside price", () => {
    render(<Card title="Título" price="R$ 99" priceSuffix="/mo" />);
    expect(screen.getByText("/mo")).toBeInTheDocument();
  });

  it("does not render priceSuffix when price is omitted", () => {
    render(<Card title="Título" priceSuffix="/mo" />);
    expect(screen.queryByText("/mo")).not.toBeInTheDocument();
  });

  it("renders topBadge when provided", () => {
    render(<Card title="Título" topBadge="Most Popular" />);
    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("does not render topBadge when omitted", () => {
    render(<Card title="Título" />);
    expect(screen.queryByText("Most Popular")).not.toBeInTheDocument();
  });
});
