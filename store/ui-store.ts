import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  taskDialogOpen: boolean;
  setTaskDialogOpen: (open: boolean) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  filters: {
    priority: string | null;
    tagId: string | null;
  };
  setFilter: (key: "priority" | "tagId", value: string | null) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  taskDialogOpen: false,
  setTaskDialogOpen: (open) => set({ taskDialogOpen: open }),
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  filters: {
    priority: null,
    tagId: null,
  },
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: { priority: null, tagId: null } }),
}));
