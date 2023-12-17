import { create } from "zustand";

type PhotoModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const usePhotoModal = create<PhotoModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
