import { create } from "zustand";

type PlayedMediaStore = {
  playedIds: { [key: string]: boolean };
  setPlayedId: (id: string, isPlaying: boolean) => void;
};

const usePlayedMedia = create<PlayedMediaStore>((set) => ({
  playedIds: {},
  setPlayedId: (id, isPlaying) =>
    set((state) => ({
      playedIds: {
        ...state.playedIds,
        [id]: isPlaying,
      },
    })),
}));

export default usePlayedMedia;
