import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Title } from ".";

describe("Title", () => {
  it("renders the title text", () => {
    render(<Title title="Inteligência e Automação" description="Descrição" />);
    expect(screen.getByText("Inteligência e Automação")).toBeInTheDocument();
  });

  it("renders title as h1", () => {
    render(<Title title="Inteligência e Automação" description="Descrição" />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Inteligência e Automação",
      }),
    ).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<Title title="Título" description="Descrição detalhada." />);
    expect(screen.getByText("Descrição detalhada.")).toBeInTheDocument();
  });

  it("renders different title content", () => {
    render(<Title title="Novo título" description="Outra descrição" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Novo título" }),
    ).toBeInTheDocument();
  });

  it("renders different description content", () => {
    render(<Title title="Título" description="Outra descrição aqui." />);
    expect(screen.getByText("Outra descrição aqui.")).toBeInTheDocument();
  });

  it("applies gradient classes to the heading", () => {
    render(<Title title="Título" description="Descrição" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("bg-clip-text");
    expect(heading).toHaveClass("text-transparent");
  });

  it("renders both title and description in the same component", () => {
    render(
      <Title title="Título Principal" description="Subtítulo explicativo." />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Subtítulo explicativo.")).toBeInTheDocument();
  });
});
