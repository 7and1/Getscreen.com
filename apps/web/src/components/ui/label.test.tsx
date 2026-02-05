import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label component", () => {
  it("renders label", () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText("Label Text")).toBeInTheDocument();
  });

  it("renders with htmlFor attribute", () => {
    render(<Label htmlFor="input-id">Label</Label>);
    const label = screen.getByText("Label");
    expect(label).toHaveAttribute("for", "input-id");
  });

  it("accepts custom className", () => {
    render(<Label className="custom-class">Label</Label>);
    expect(screen.getByText("Label")).toHaveClass("custom-class");
  });

  it("associates with input", () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </>,
    );
    const label = screen.getByText("Test Label");
    expect(label).toHaveAttribute("for", "test-input");
  });
});
