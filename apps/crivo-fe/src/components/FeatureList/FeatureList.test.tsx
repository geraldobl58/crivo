import { render, screen } from "@testing-library/react";
import { X } from "lucide-react";
import { describe, expect, it } from "vitest";

import { FeatureList } from ".";

describe("FeatureList", () => {
  it("renders all items", () => {
    render(<FeatureList items={["Item A", "Item B", "Item C"]} />);
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
    expect(screen.getByText("Item C")).toBeInTheDocument();
  });

  it("renders a <ul> list element", () => {
    render(<FeatureList items={["Item A"]} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders one <li> per item", () => {
    render(<FeatureList items={["Item A", "Item B", "Item C"]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders a custom icon when provided", () => {
    render(
      <FeatureList
        items={["Item A"]}
        icon={<span data-testid="custom-icon" />}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("applies custom iconClassName to the icon wrapper", () => {
    const { container } = render(
      <FeatureList items={["Item A"]} iconClassName="text-rose-400" />,
    );
    expect(container.querySelector(".text-rose-400")).toBeInTheDocument();
  });

  it("applies default indigo iconClassName when not provided", () => {
    const { container } = render(<FeatureList items={["Item A"]} />);
    expect(container.querySelector(".text-indigo-400")).toBeInTheDocument();
  });

  it("renders an empty list when items is empty", () => {
    render(<FeatureList items={[]} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("renders custom icon instead of default Check", () => {
    render(
      <FeatureList
        items={["Item A"]}
        icon={<X data-testid="x-icon" size={14} />}
      />,
    );
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });
});
