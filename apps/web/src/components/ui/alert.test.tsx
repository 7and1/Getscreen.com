import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

describe("Alert components", () => {
  describe("Alert", () => {
    it("renders alert", () => {
      render(<Alert data-testid="alert">Alert content</Alert>);
      expect(screen.getByTestId("alert")).toBeInTheDocument();
    });

    it("renders with default variant", () => {
      render(<Alert>Default</Alert>);
      expect(screen.getByText("Default")).toBeInTheDocument();
    });

    it("renders with destructive variant", () => {
      render(<Alert variant="destructive">Destructive</Alert>);
      expect(screen.getByText("Destructive")).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      render(
        <Alert className="custom-class" data-testid="alert">
          Content
        </Alert>,
      );
      expect(screen.getByTestId("alert")).toHaveClass("custom-class");
    });
  });

  describe("AlertTitle", () => {
    it("renders alert title", () => {
      render(<AlertTitle>Alert Title</AlertTitle>);
      expect(screen.getByText("Alert Title")).toBeInTheDocument();
    });
  });

  describe("AlertDescription", () => {
    it("renders alert description", () => {
      render(<AlertDescription>Alert Description</AlertDescription>);
      expect(screen.getByText("Alert Description")).toBeInTheDocument();
    });
  });

  describe("Complete Alert", () => {
    it("renders complete alert structure", () => {
      render(
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>,
      );
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });
});
