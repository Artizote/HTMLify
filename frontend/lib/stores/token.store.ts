import { create } from "zustand";

interface TokenStore {
  accessToken: string | null;

  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  accessToken: null,

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearAccessToken: () => set({ accessToken: null }),
}));
