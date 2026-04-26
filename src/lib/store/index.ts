/**
 * Global State Management — Zustand stores
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Auth Store ─────────────────────────────────────────────────────────────
interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'CREATOR' | 'CUSTOMER' | 'ADMIN';
  } | null;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'sellspark-auth' }
  )
);

// ─── Store Builder State ────────────────────────────────────────────────────
interface StoreBuilderState {
  step: number;
  storeData: {
    name: string;
    niche: string;
    description: string;
    style: 'minimal' | 'bold' | 'elegant' | 'playful' | 'professional';
    products: Array<{
      name: string;
      type: string;
      price: number;
      description: string;
    }>;
  };
  setStep: (step: number) => void;
  updateStoreData: (data: Partial<StoreBuilderState['storeData']>) => void;
  addProduct: (product: StoreBuilderState['storeData']['products'][0]) => void;
  removeProduct: (index: number) => void;
  reset: () => void;
}

const defaultStoreData: StoreBuilderState['storeData'] = {
  name: '',
  niche: '',
  description: '',
  style: 'minimal',
  products: [],
};

export const useStoreBuilder = create<StoreBuilderState>()((set) => ({
  step: 0,
  storeData: defaultStoreData,
  setStep: (step) => set({ step }),
  updateStoreData: (data) =>
    set((state) => ({ storeData: { ...state.storeData, ...data } })),
  addProduct: (product) =>
    set((state) => ({
      storeData: { ...state.storeData, products: [...state.storeData.products, product] },
    })),
  removeProduct: (index) =>
    set((state) => ({
      storeData: {
        ...state.storeData,
        products: state.storeData.products.filter((_, i) => i !== index),
      },
    })),
  reset: () => set({ step: 0, storeData: defaultStoreData }),
}));

// ─── Dashboard State ────────────────────────────────────────────────────────
interface DashboardState {
  sidebarOpen: boolean;
  activeSection: string;
  toggleSidebar: () => void;
  setActiveSection: (section: string) => void;
}

export const useDashboard = create<DashboardState>()((set) => ({
  sidebarOpen: true,
  activeSection: 'overview',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveSection: (section) => set({ activeSection: section }),
}));

// ─── AI Marketplace State ───────────────────────────────────────────────────
interface MarketplaceState {
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sort: MarketplaceState['sortBy']) => void;
}

export const useMarketplace = create<MarketplaceState>()((set) => ({
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'popular',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sort) => set({ sortBy: sort }),
}));
