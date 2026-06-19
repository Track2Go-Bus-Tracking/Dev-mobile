import { supabase } from './supabase';
import type { Terminal } from '@/types';
import { MOCK_TERMINALS } from '@/utils/mockData';

export const terminalService = {
  async getAll(): Promise<Terminal[]> {
    try {
      const { data, error } = await supabase.from('terminals').select('*').order('name');
      if (error) throw error;
      
      const terminals = data && data.length > 0 ? (data as Terminal[]) : MOCK_TERMINALS;
      return terminals.map((t) => ({
        ...t,
        operating_hours: t.operating_hours ?? '5:00 AM – 10:00 PM',
      }));
    } catch (err) {
      console.warn('Failed to load terminals from Supabase, using mock data:', err);
      return MOCK_TERMINALS;
    }
  },

  async getById(id: string): Promise<Terminal> {
    try {
      const { data, error } = await supabase.from('terminals').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Terminal;
    } catch (err) {
      return MOCK_TERMINALS.find((t) => t.id === id) ?? MOCK_TERMINALS[0];
    }
  },
};
