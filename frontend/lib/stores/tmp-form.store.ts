import { create } from "zustand";

import { TmpFile } from "@/lib/modules/tmp/tmp.types";

interface TmpFormStore {
  folderName: string;
  file: File | null;
  name: string;
  expiry: string;
  customExpiry: string;
  customUnit: string;
  error: string;
  result: TmpFile | null;
  isPending: boolean;

  setFile: (file: File | null) => void;
  setName: (name: string) => void;
  setExpiry: (expiry: string) => void;
  setCustomExpiry: (customExpiry: string) => void;
  setCustomUnit: (customUnit: string) => void;
  setError: (error: string) => void;
  setResult: (result: TmpFile | null) => void;
  setIsPending: (isPending: boolean) => void;
  reset: () => void;
}

const initialState = {
  folderName: "",
  file: null,
  name: "",
  expiry: "86400",
  customExpiry: "60",
  customUnit: "60",
  error: "",
  result: null as TmpFile | null,
  isPending: false,
};

export const useTmpFormStore = create<TmpFormStore>((set) => ({
  ...initialState,

  setFile: (file) => set({ file }),
  setName: (name) => set({ name }),
  setExpiry: (expiry) => set({ expiry }),
  setCustomExpiry: (customExpiry) => set({ customExpiry }),
  setCustomUnit: (customUnit) => set({ customUnit }),
  setError: (error) => set({ error }),
  setResult: (result) => set({ result }),
  setIsPending: (isPending) => set({ isPending }),

  reset: () => set({ ...initialState, result: null }),
}));
