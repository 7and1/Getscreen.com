import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConsentState = {
  decided_at: number | null;
  analytics: boolean;
  marketing: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (prefs: { analytics: boolean; marketing: boolean }) => void;
};

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      decided_at: null,
      analytics: false,
      marketing: false,
      acceptAll: () =>
        set({ decided_at: Date.now(), analytics: true, marketing: true }),
      rejectAll: () =>
        set({ decided_at: Date.now(), analytics: false, marketing: false }),
      save: (prefs) =>
        set({
          decided_at: Date.now(),
          analytics: Boolean(prefs.analytics),
          marketing: Boolean(prefs.marketing),
        }),
    }),
    { name: "vl_consent_v1" },
  ),
);
