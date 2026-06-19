import { supabase } from './supabase';
import type { Profile, UserRole } from '@/types';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        role: 'passenger',
      },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned from sign up');

  // Wait for the trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 1000));

  let profile;
  try {
    profile = await fetchProfile(data.user.id);
  } catch (fetchError) {
    // Fallback: manually create profile if trigger failed
    const { error: insertError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      name: name,
      role: 'passenger',
    });

    if (insertError) {
      console.error('Failed to create profile:', insertError);
      throw new Error('Failed to create user profile');
    }

    profile = await fetchProfile(data.user.id);
  }

  return { session: data.session, profile };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned from sign in');

  const profile = await fetchProfile(data.user.id);
  return { session: data.session, profile };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    const { data: legacyUser, error: legacyError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .single();

    if (legacyError) throw error;

    return {
      id: legacyUser.id,
      name: legacyUser.name,
      email: legacyUser.email,
      role: mapLegacyRole(legacyUser.role),
      assigned_bus_id: null,
      phone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
  }

  return data as Profile;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

function mapLegacyRole(role: string): UserRole {
  if (role === 'driver' || role === 'conductor' || role === 'passenger') {
    return role;
  }
  return 'passenger';
}

export function isDriverRole(role: UserRole): boolean {
  return role === 'driver' || role === 'conductor';
}
