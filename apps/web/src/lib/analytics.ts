import { useConsentStore } from "@/stores/useConsentStore";

export function trackEvent(name: string, params?: Record<string, unknown>) {
  const consent = useConsentStore.getState();
  if (!consent.analytics) return;
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}
