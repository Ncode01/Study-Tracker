// src/store/navStore.ts
import { create } from 'zustand';

interface NavState {
  activeTab: 'dashboard' | 'timer' | 'history' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'timer' | 'history' | 'profile') => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));