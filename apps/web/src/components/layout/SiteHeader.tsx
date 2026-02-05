import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useTheme } from "@/hooks/useTheme";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const nav = [
  { to: "/product/rpa-automation", label: "RPA" },
  { to: "/product/web-scraping", label: "Web Scraping" },
  { to: "/use-cases", label: "Use cases" },
  { to: "/compare/teamviewer-alternative", label: "Compare" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const isMobile = !useMediaQuery("md");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold tracking-tight">
            VisionLink AI
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              Menu
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="hidden md:inline-flex"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <Link to="/app">Open App</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/trial">Start free trial</Link>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActive && "text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/app">Open App</Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggle}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? "Light" : "Dark"} mode
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
