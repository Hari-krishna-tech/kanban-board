import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Board } from "@/types";

interface BoardStore {
  board: Board | null;
  setBoard: (updater: Board | ((prev: Board) => Board)) => void;
  initializeBoard: (incoming: Board) => void;
  clearBoard: () => void;
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set) => ({
      board: null,
      setBoard: (updater) =>
        set((state) => {
          if (typeof updater === "function") {
            if (!state.board) return state;
            return { board: updater(state.board) };
          }
          return { board: updater };
        }),
      initializeBoard: (incoming) => set({ board: incoming }),
      clearBoard: () => set({ board: null }),
    }),
    {
      name: "kanban-board-state",
      partialize: (state) => ({ board: state.board }),
    }
  )
);
