import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key.trim() || null }),
      clear: () => set({ apiKey: null }),
    }),
    { name: "vl_auth" },
  ),
);
