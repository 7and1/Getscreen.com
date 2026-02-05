import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

export function AppHomePage() {
  const apiKey = useAuthStore((s) => s.apiKey);

  return (
    <div>
      <Seo title="App | VisionLink AI" noindex />
      <h1 className="text-2xl font-semibold tracking-tight">App</h1>
      <p className="mt-2 text-muted-foreground">
        Connect an API key to access your device fleet and sessions.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {apiKey ? (
          <Button asChild>
            <Link to="/app/devices">Go to devices</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/app/login">Connect API key</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/">Back to marketing</Link>
        </Button>
      </div>
    </div>
  );
}
