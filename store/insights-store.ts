import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InsightsData } from "@/types";

interface InsightsStore {
  insights: InsightsData | null;
  setInsights: (data: InsightsData) => void;
  clearInsights: () => void;
}

export const useInsightsStore = create<InsightsStore>()(
  persist(
    (set) => ({
      insights: null,
      setInsights: (data) => set({ insights: data }),
      clearInsights: () => set({ insights: null }),
    }),
    {
      name: "kanban-insights-state",
      partialize: (state) => ({ insights: state.insights }),
    }
  )
);
