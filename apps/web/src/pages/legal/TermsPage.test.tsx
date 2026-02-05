import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import TermsPage from "@/pages/legal/TermsPage";

describe("TermsPage", () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <HelmetProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </HelmetProvider>,
    );
  };

  it("renders terms page", () => {
    renderWithProviders(<TermsPage />);
    const heading = screen.queryByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("contains terms-related content", () => {
    renderWithProviders(<TermsPage />);
    const matches = screen.queryAllByText(
      /terms|conditions|agreement|service/i,
    );
    expect(matches.length).toBeGreaterThan(0);
  });
});
