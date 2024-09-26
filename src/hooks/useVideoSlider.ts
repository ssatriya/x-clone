import { create } from "zustand";

interface VideoState {
  currentTime: number;
  totalDuration: number;
  isSeeking: boolean;
  isPlaying: boolean;
  updateCurrentTime: (time: number) => void;
  updateTotalDuration: (duration: number) => void;
  updateSeeking: (isSeeking: boolean) => void;
  updateIsPlaying: (isPlaying: boolean) => void;
}

export const useVideoSlider = create<VideoState>((set) => ({
  currentTime: 0,
  totalDuration: 0,
  isSeeking: false,
  isPlaying: false,
  updateCurrentTime: (time) => set({ currentTime: time }),
  updateTotalDuration: (duration) => set({ totalDuration: duration }),
  updateSeeking: (isSeeking) => set({ isSeeking }),
  updateIsPlaying: (isPlaying) => set({ isPlaying }),
}));
