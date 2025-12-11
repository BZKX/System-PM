import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { System, Plan } from '../types';

export interface QuickCheckHistoryItem {
  id: string;
  timestamp: number;
  startDate: string;
  endDate: string;
  systemIds: string[];
}

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  systems: System[];
  plans: Plan[];
  
  // Actions
  addSystem: (system: System) => void;
  updateSystem: (system: System) => void;
  deleteSystem: (id: string) => void;
  
  addPlan: (plan: Plan) => void;
  updatePlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  
  // Initialization
  setInitialData: (systems: System[], plans: Plan[]) => void;
  clearData: () => void;

  // Guide
  hasSeenGuide: boolean;
  completeGuide: () => void;
  resetGuide: () => void;

  // Quick Check History
  quickCheckHistory: QuickCheckHistoryItem[];
  addQuickCheckHistory: (item: Omit<QuickCheckHistoryItem, 'id' | 'timestamp'>) => void;
  clearQuickCheckHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      systems: [],
      plans: [],

      addSystem: (system) => set((state) => ({ systems: [...state.systems, system] })),
      updateSystem: (system) => set((state) => ({
        systems: state.systems.map((s) => (s.id === system.id ? system : s)),
      })),
      deleteSystem: (id) => set((state) => ({
        systems: state.systems.filter((s) => s.id !== id),
      })),

      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (plan) => set((state) => ({
        plans: state.plans.map((p) => (p.id === plan.id ? plan : p)),
      })),
      deletePlan: (id) => set((state) => ({
        plans: state.plans.filter((p) => p.id !== id),
      })),

      setInitialData: (systems, plans) => set({ systems, plans }),
      clearData: () => set({ systems: [], plans: [] }),

      hasSeenGuide: false,
      completeGuide: () => set({ hasSeenGuide: true }),
      resetGuide: () => set({ hasSeenGuide: false }),

      quickCheckHistory: [],
      addQuickCheckHistory: (item) => set((state) => {
        const newItem: QuickCheckHistoryItem = {
          ...item,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
        };
        // Prepend and keep top 3
        const newHistory = [newItem, ...state.quickCheckHistory].slice(0, 3);
        return { quickCheckHistory: newHistory };
      }),
      clearQuickCheckHistory: () => set({ quickCheckHistory: [] }),
    }),
    {
      name: 'system-pm-storage',
    }
  )
);
