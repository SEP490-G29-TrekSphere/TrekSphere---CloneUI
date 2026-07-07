import { create } from 'zustand';

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  roles?: string[];
}

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
