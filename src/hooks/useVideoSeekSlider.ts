import { create } from "zustand";

interface VideoState {
  isSeeking: boolean;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  updateCurrentTime: (time: number) => void;
  updateSeeking: (isSeeking: boolean) => void;
  updateIsPlaying: (isPlaying: boolean) => void;
  updateTotalDuration: (duration: number) => void;
}

const useVideoSeekSlider = create<VideoState>((set) => ({
  currentTime: 0,
  totalDuration: 0,
  isSeeking: false,
  isPlaying: false,
  updateCurrentTime: (time) => set({ currentTime: time }),
  updateTotalDuration: (duration) => set({ totalDuration: duration }),
  updateSeeking: (isSeeking) => set({ isSeeking }),
  updateIsPlaying: (isPlaying) => set({ isPlaying }),
}));

export default useVideoSeekSlider;
