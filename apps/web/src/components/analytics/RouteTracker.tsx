import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useConsentStore } from "@/stores/useConsentStore";

export function RouteTracker() {
  const location = useLocation();
  const analytics = useConsentStore((s) => s.analytics);

  useEffect(() => {
    if (!analytics) return;
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: `${location.pathname}${location.search}`,
    });
  }, [analytics, location.pathname, location.search]);

  return null;
}
