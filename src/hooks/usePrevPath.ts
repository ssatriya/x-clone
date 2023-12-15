import { create } from "zustand";

type PrevPathStore = {
  path: string | undefined;
  prevPath: (path: string) => void;
};

export const usePrevPath = create<PrevPathStore>((set) => ({
  path: undefined,
  prevPath: (path: string) => set({ path: path }),
}));
