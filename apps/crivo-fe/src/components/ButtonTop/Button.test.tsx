import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ButtonTop } from ".";

describe("ButtonTop", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it("renders a button", () => {
    render(<ButtonTop />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("scrolls to top on click", () => {
    render(<ButtonTop />);
    fireEvent.click(screen.getByRole("button"));
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });
});
