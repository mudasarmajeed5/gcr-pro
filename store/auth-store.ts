// store/authStore.ts
import { create } from "zustand";

interface AuthStore {
  authuserId: number;
  setAuthuser: (authuser: number) => void;
  fetchAuthuser: () => Promise<void>;
}

interface AuthUserResponse {
  authUserId?: number | null;
  error?: string;
  themeId?: string;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authuserId: 0,

  setAuthuser: (authuserId) => set({ authuserId }),

  fetchAuthuser: async () => {
    try {
      const res = await fetch("/api/auth/authuser");
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        console.error(
          "Failed to fetch authuser: non-JSON response",
          res.status,
        );
        return;
      }

      const data: AuthUserResponse = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Unauthenticated users can hit this on first load before sign-in.
          return;
        }
        console.error("Failed to fetch authuser:", {
          url: "/api/auth/authuser",
          status: res.status,
          statusText: res.statusText,
          data,
        });
        return;
      }

      set({ authuserId: data.authUserId ?? 0 });
    } catch (error) {
      console.error("Failed to fetch authuser:", error);
    }
  },
}));
