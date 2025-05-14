// src/store/navStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NavRoute } from '../types';

interface NavState {
  activeTab: NavRoute;
  setActiveTab: (tab: NavRoute) => void;
}

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      activeTab: 'dashboard' as NavRoute,
      setActiveTab: (tab: NavRoute) => set({ activeTab: tab }),
    }),
    {
      name: 'nav-storage',
    }
  )
);