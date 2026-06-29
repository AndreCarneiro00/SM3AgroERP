import { create } from 'zustand';

interface UiState {
  isDrawerCollapsed: boolean;
  setDrawerCollapsed: (collapsed: boolean) => void;
  toggleDrawerCollapsed: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isDrawerCollapsed: false,
  setDrawerCollapsed: (collapsed) => set({ isDrawerCollapsed: collapsed }),
  toggleDrawerCollapsed: () =>
    set((state) => ({ isDrawerCollapsed: !state.isDrawerCollapsed })),
}));
