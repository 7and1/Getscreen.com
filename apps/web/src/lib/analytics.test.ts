import { describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics";
import { useConsentStore } from "@/stores/useConsentStore";

vi.mock("@/stores/useConsentStore", () => ({
  useConsentStore: {
    getState: vi.fn(),
  },
}));

describe("analytics", () => {
  describe("trackEvent", () => {
    it("tracks event when analytics consent given", () => {
      const mockGtag = vi.fn();
      (global as any).window = { gtag: mockGtag };
      vi.mocked(useConsentStore.getState).mockReturnValue({
        analytics: true,
        marketing: false,
        decided_at: Date.now(),
        acceptAll: vi.fn(),
        rejectAll: vi.fn(),
        save: vi.fn(),
      });

      trackEvent("test_event", { param: "value" });

      expect(mockGtag).toHaveBeenCalledWith("event", "test_event", {
        param: "value",
      });
    });

    it("does not track when analytics consent not given", () => {
      const mockGtag = vi.fn();
      (global as any).window = { gtag: mockGtag };
      vi.mocked(useConsentStore.getState).mockReturnValue({
        analytics: false,
        marketing: false,
        decided_at: Date.now(),
        acceptAll: vi.fn(),
        rejectAll: vi.fn(),
        save: vi.fn(),
      });

      trackEvent("test_event");

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it("does not track when gtag not available", () => {
      (global as any).window = {};
      vi.mocked(useConsentStore.getState).mockReturnValue({
        analytics: true,
        marketing: false,
        decided_at: Date.now(),
        acceptAll: vi.fn(),
        rejectAll: vi.fn(),
        save: vi.fn(),
      });

      expect(() => trackEvent("test_event")).not.toThrow();
    });

    it("handles event without params", () => {
      const mockGtag = vi.fn();
      (global as any).window = { gtag: mockGtag };
      vi.mocked(useConsentStore.getState).mockReturnValue({
        analytics: true,
        marketing: false,
        decided_at: Date.now(),
        acceptAll: vi.fn(),
        rejectAll: vi.fn(),
        save: vi.fn(),
      });

      trackEvent("simple_event");

      expect(mockGtag).toHaveBeenCalledWith("event", "simple_event", {});
    });

    it("does not track in SSR environment", () => {
      const mockGtag = vi.fn();
      delete (global as any).window;
      vi.mocked(useConsentStore.getState).mockReturnValue({
        analytics: true,
        marketing: false,
        decided_at: Date.now(),
        acceptAll: vi.fn(),
        rejectAll: vi.fn(),
        save: vi.fn(),
      });

      expect(() => trackEvent("test_event")).not.toThrow();
      expect(mockGtag).not.toHaveBeenCalled();
    });
  });
});
