import { Outlet } from "react-router-dom";
import { RouteTracker } from "@/components/analytics/RouteTracker";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

export function AppLayout() {
  const isAuthed = useAuthStore((s) => Boolean(s.apiKey));

  return (
    <div className="min-h-dvh">
      <RouteTracker />
      <Seo title="VisionLink AI App" noindex />
      <header className="border-b border-border/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="font-semibold tracking-tight">VisionLink AI</div>
          <div className="flex items-center gap-2">
            {isAuthed ? (
              <span className="text-sm text-muted-foreground">
                API key connected
              </span>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <a href="/">Marketing</a>
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
      <CookieConsentBanner />
      <OfflineIndicator />
    </div>
  );
}
