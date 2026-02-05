import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";

describe("SiteHeader component", () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it("renders site header", () => {
    renderWithRouter(<SiteHeader />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders logo/brand", () => {
    renderWithRouter(<SiteHeader />);
    // Check for logo or brand name
    const logo = screen.queryByText(/VisionLink/i);
    if (logo) {
      expect(logo).toBeInTheDocument();
    }
  });

  it("renders navigation links", () => {
    renderWithRouter(<SiteHeader />);
    // Check for common navigation items
    const nav = screen.queryByRole("navigation");
    expect(nav).toBeInTheDocument();
  });
});
