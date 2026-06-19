import { create } from 'zustand';
import type { Profile } from '@/types';
import {
  fetchProfile,
  getCurrentSession,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  isDriverRole,
} from '@/services/authService';
import { supabase } from '@/services/supabase';

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isDriver: () => boolean;
  isPassenger: () => boolean;
  signInAsDemo: (role: 'passenger' | 'driver') => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      const session = await getCurrentSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ profile, error: null });
      }
    } catch {
      set({ profile: null });
    } finally {
      set({ isInitialized: true });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id);
          set({ profile });
        } catch {
          set({ profile: null });
        }
      } else {
        set({ profile: null });
      }
    });
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { profile } = await authSignIn(email, password);
      set({ profile, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false, profile: null });
      throw err;
    }
  },

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const { profile } = await authSignUp(email, password, name);
      set({ profile, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      set({ error: message, isLoading: false, profile: null });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authSignOut();
      set({ profile: null, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  isDriver: () => {
    const { profile } = get();
    return profile ? isDriverRole(profile.role) : false;
  },

  isPassenger: () => {
    const { profile } = get();
    return profile?.role === 'passenger';
  },

  signInAsDemo: async (role) => {
    set({ isLoading: true, error: null });
    try {
      const mockProfile = {
        id: role === 'passenger' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
        name: role === 'passenger' ? 'Demo Passenger (Fortich)' : 'Demo Driver (Juan)',
        email: role === 'passenger' ? 'passenger@track2go.demo' : 'driver@track2go.demo',
        role: role,
        assigned_bus_id: role === 'driver' ? 'b-1' : null,
        phone: '+63 917 123 4567',
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      set({ profile: mockProfile, isLoading: false, error: null });
    } catch (err) {
      set({ error: 'Demo sign-in failed', isLoading: false });
    }
  },
}));
