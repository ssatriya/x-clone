import { create } from "zustand";

interface CurrentFocusPostState {
  focusPostId: string;
  setFocusPost: (id: string) => void;
}

const useCurrentFocusPost = create<CurrentFocusPostState>()((set) => ({
  focusPostId: "",
  setFocusPost: (id) => set((state) => ({ focusPostId: id })),
}));

export default useCurrentFocusPost;
