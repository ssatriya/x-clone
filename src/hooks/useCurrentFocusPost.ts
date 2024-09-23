import { create } from "zustand";

interface CurrentFocusPostState {
  focusPostId: string;
  setFocusPost: (id: string) => void;
}

const useCurrentFocusPost = create<CurrentFocusPostState>()((set) => ({
  focusPostId: "",
  setFocusPost: (id) => set(() => ({ focusPostId: id })),
}));

export default useCurrentFocusPost;
