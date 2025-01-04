import { create } from "zustand";

interface DrawerStore {
  isOpen: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
}

export const useDrawer = create<DrawerStore>((set) => ({
  isOpen: false,
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  closeDrawer: () => set({ isOpen: false }),
}));
