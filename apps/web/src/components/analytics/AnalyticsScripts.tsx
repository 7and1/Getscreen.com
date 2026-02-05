import { useEffect } from "react";
import { useConsentStore } from "@/stores/useConsentStore";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadScript(id: string, src: string): HTMLScriptElement {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (el) return el;
  el = document.createElement("script");
  el.id = id;
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
  return el;
}

export function AnalyticsScripts() {
  const analytics = useConsentStore((s) => s.analytics);

  useEffect(() => {
    if (!analytics) return;
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as
      | string
      | undefined;
    if (!measurementId) return;

    loadScript(
      "vl-ga4",
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
    );
    window.dataLayer = window.dataLayer ?? [];
    window.gtag =
      window.gtag ??
      ((...args: unknown[]) => {
        window.dataLayer?.push(args);
      });

    window.gtag("js", new Date());
    window.gtag("config", measurementId, { anonymize_ip: true });
  }, [analytics]);

  return null;
}
