import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Seo from "@/components/Seo";

describe("Seo component", () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <HelmetProvider>
        <MemoryRouter>{component}</MemoryRouter>
      </HelmetProvider>,
    );
  };

  it("renders without crashing", () => {
    renderWithProviders(<Seo title="Test Page" />);
  });

  it("sets page title", () => {
    renderWithProviders(<Seo title="Test Page" />);
    return waitFor(() => {
      expect(document.title).toContain("Test Page");
    });
  });

  it("sets description", async () => {
    renderWithProviders(<Seo title="Test" description="Test description" />);
    await waitFor(() => {
      const meta = document.querySelector('meta[name="description"]');
      expect(meta).toHaveAttribute("content", "Test description");
    });
  });

  it("sets canonical URL", async () => {
    renderWithProviders(<Seo title="Test" pathname="/test-page" />);
    await waitFor(() => {
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).toHaveAttribute(
        "href",
        expect.stringContaining("/test-page"),
      );
    });
  });

  it("sets og:image", async () => {
    renderWithProviders(<Seo title="Test" imagePath="/test-image.jpg" />);
    await waitFor(() => {
      const ogImage = document.querySelector('meta[property="og:image"]');
      expect(ogImage).toHaveAttribute(
        "content",
        expect.stringContaining("/test-image.jpg"),
      );
    });
  });

  it("handles noindex", () => {
    renderWithProviders(<Seo title="Test" noindex />);
  });
});
