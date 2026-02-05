import { describe, expect, it, beforeEach } from "vitest";
import { useConsentStore } from "@/stores/useConsentStore";

describe("useConsentStore", () => {
  beforeEach(() => {
    const { rejectAll } = useConsentStore.getState();
    rejectAll();
    useConsentStore.setState({ decided_at: null });
  });

  it("initializes with no consent", () => {
    const state = useConsentStore.getState();
    expect(state.analytics).toBe(false);
    expect(state.marketing).toBe(false);
  });

  it("accepts all consents", () => {
    const { acceptAll } = useConsentStore.getState();
    acceptAll();
    const state = useConsentStore.getState();
    expect(state.analytics).toBe(true);
    expect(state.marketing).toBe(true);
    expect(state.decided_at).toBeGreaterThan(0);
  });

  it("rejects all consents", () => {
    const { rejectAll } = useConsentStore.getState();
    rejectAll();
    const state = useConsentStore.getState();
    expect(state.analytics).toBe(false);
    expect(state.marketing).toBe(false);
    expect(state.decided_at).toBeGreaterThan(0);
  });

  it("saves custom preferences", () => {
    const { save } = useConsentStore.getState();
    save({ analytics: true, marketing: false });
    const state = useConsentStore.getState();
    expect(state.analytics).toBe(true);
    expect(state.marketing).toBe(false);
    expect(state.decided_at).toBeGreaterThan(0);
  });

  it("saves opposite preferences", () => {
    const { save } = useConsentStore.getState();
    save({ analytics: false, marketing: true });
    const state = useConsentStore.getState();
    expect(state.analytics).toBe(false);
    expect(state.marketing).toBe(true);
  });

  it("updates decided_at timestamp", () => {
    const { acceptAll } = useConsentStore.getState();
    const before = Date.now();
    acceptAll();
    const after = Date.now();
    const state = useConsentStore.getState();
    expect(state.decided_at).toBeGreaterThanOrEqual(before);
    expect(state.decided_at).toBeLessThanOrEqual(after);
  });

  it("can change preferences", () => {
    const { acceptAll, rejectAll } = useConsentStore.getState();
    acceptAll();
    expect(useConsentStore.getState().analytics).toBe(true);
    rejectAll();
    expect(useConsentStore.getState().analytics).toBe(false);
  });

  it("coerces values to boolean", () => {
    const { save } = useConsentStore.getState();
    save({ analytics: 1 as any, marketing: 0 as any });
    const state = useConsentStore.getState();
    expect(state.analytics).toBe(true);
    expect(state.marketing).toBe(false);
  });
});
