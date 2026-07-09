import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      user: null,
      setUser: (user) => set({ user }),
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'treksphere-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
