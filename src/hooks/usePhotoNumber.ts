import { create } from "zustand";

type PhotoNumberStore = {
  photoNumber: number;
  setPhotoNumber: (number: number) => void;
};

export const usePhotoNumber = create<PhotoNumberStore>((set) => ({
  photoNumber: 0,
  setPhotoNumber: (number: number) =>
    set({
      photoNumber: number,
    }),
}));
