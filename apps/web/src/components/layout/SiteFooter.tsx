import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          <div className="font-medium text-foreground">VisionLink AI</div>
          <div>
            AI-native remote desktop for RPA, web scraping, and IT support.
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
