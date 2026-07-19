import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  onboardingCompleted: boolean | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingCompleted: (status: boolean | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  onboardingCompleted: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
}));
