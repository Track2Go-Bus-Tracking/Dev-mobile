import { supabase } from './supabase';
import type { EmergencyAlert } from '@/types';
import { MOCK_EMERGENCIES } from '@/utils/mockData';

export const emergencyService = {
  async getAll(status?: string): Promise<EmergencyAlert[]> {
    try {
      let query = supabase
        .from('emergency_alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return (data && data.length > 0) ? (data as EmergencyAlert[]) : MOCK_EMERGENCIES;
    } catch (err) {
      console.warn('Failed to load emergencies from Supabase, using mock data:', err);
      if (status) {
        return MOCK_EMERGENCIES.filter(e => e.status === status);
      }
      return MOCK_EMERGENCIES;
    }
  },

  async getActiveForBus(busId: string): Promise<EmergencyAlert | null> {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('bus_id', busId)
        .eq('status', 'active')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? (data as EmergencyAlert) : (MOCK_EMERGENCIES.find(e => e.bus_id === busId && e.status === 'active') || null);
    } catch (err) {
      return MOCK_EMERGENCIES.find(e => e.bus_id === busId && e.status === 'active') || null;
    }
  },

  async createAlert(payload: {
    bus_id: string;
    latitude: number;
    longitude: number;
    alert_type?: string;
  }): Promise<EmergencyAlert> {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .insert({
          bus_id: payload.bus_id,
          latitude: payload.latitude,
          longitude: payload.longitude,
          alert_type: payload.alert_type ?? 'panic_button',
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('buses')
        .update({ status: 'emergency' })
        .eq('id', payload.bus_id);

      return data as EmergencyAlert;
    } catch (err) {
      console.warn('Failed to create emergency alert in Supabase, mock alert created local-only:', err);
      const newMockAlert: EmergencyAlert = {
        id: 'new-mock-alert-' + Math.random().toString(),
        bus_id: payload.bus_id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        alert_type: payload.alert_type ?? 'panic_button',
        status: 'active',
        image_url: null,
        timestamp: new Date().toISOString(),
      };
      MOCK_EMERGENCIES.unshift(newMockAlert);
      return newMockAlert;
    }
  },
};
