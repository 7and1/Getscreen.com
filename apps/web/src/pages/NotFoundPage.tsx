import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="container py-16">
      <Seo title="Page not found | VisionLink AI" noindex />
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you’re looking for doesn’t exist.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app">Open app</Link>
        </Button>
      </div>
    </div>
  );
}
