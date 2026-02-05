import { Outlet } from "react-router-dom";
import { RouteTracker } from "@/components/analytics/RouteTracker";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function MarketingLayout() {
  return (
    <div className="min-h-dvh">
      <RouteTracker />
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="min-h-[calc(100dvh-3.5rem)]">
        <Outlet />
      </main>
      <SiteFooter />
      <CookieConsentBanner />
    </div>
  );
}
