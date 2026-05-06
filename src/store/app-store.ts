import { create } from 'zustand';
import type { AppView, SearchFilters } from '@/types';

const DEFAULT_FILTERS: SearchFilters = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
};

interface AppState {
  currentView: AppView;
  viewParams: Record<string, unknown>;
  sidebarOpen: boolean;
  searchQuery: string;
  filters: SearchFilters;

  setView: (view: AppView, params?: Record<string, unknown>) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  viewParams: {},
  sidebarOpen: false,
  searchQuery: '',
  filters: { ...DEFAULT_FILTERS },

  setView: (view, params = {}) =>
    set({ currentView: view, viewParams: params }),

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () =>
    set({ filters: { ...DEFAULT_FILTERS } }),
}));
