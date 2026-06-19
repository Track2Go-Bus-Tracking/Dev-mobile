import { supabase } from './supabase';
import type { Bus, BusWithDetails, GpsLog, PassengerCount, SeatStatus } from '@/types';
import { MOCK_BUSES, MOCK_BUS_DETAILS, MOCK_GPS_LOGS, MOCK_SEATS, MOCK_PASSENGERS } from '@/utils/mockData';

export const busService = {
  async getAll(): Promise<Bus[]> {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('bus_number');
      if (error) throw error;
      return (data && data.length > 0) ? (data as Bus[]) : MOCK_BUSES;
    } catch (err) {
      console.warn('Failed to load buses from Supabase, using mock data:', err);
      return MOCK_BUSES;
    }
  },

  async getById(id: string): Promise<Bus> {
    try {
      const { data, error } = await supabase.from('buses').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Bus;
    } catch (err) {
      console.warn(`Failed to load bus ${id} from Supabase, using mock data:`, err);
      return MOCK_BUSES.find(b => b.id === id) ?? MOCK_BUSES[0];
    }
  },

  async getActive(): Promise<Bus[]> {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .eq('status', 'active')
        .order('bus_number');
      if (error) throw error;
      return (data && data.length > 0) ? (data as Bus[]) : MOCK_BUSES.filter(b => b.status === 'active');
    } catch (err) {
      console.warn('Failed to load active buses from Supabase, using mock data:', err);
      return MOCK_BUSES.filter(b => b.status === 'active');
    }
  },

  async getWithDetails(busId?: string): Promise<BusWithDetails[]> {
    try {
      const buses = busId
        ? [await this.getById(busId)]
        : await this.getActive();

      const [gpsLogs, seats, passengers] = await Promise.all([
        gpsService.getLatestAll(),
        seatService.getLatestAll(),
        passengerService.getLatestAll(),
      ]);

      return buses.map((bus) => ({
        ...bus,
        gps: gpsLogs.find((g) => g.bus_id === bus.id),
        seats: seats.find((s) => s.bus_id === bus.id),
        passengers: passengers.find((p) => p.bus_id === bus.id),
      }));
    } catch (err) {
      console.warn('Failed to fetch buses with details from Supabase, using mock details:', err);
      if (busId) {
        return MOCK_BUS_DETAILS.filter(b => b.id === busId);
      }
      return MOCK_BUS_DETAILS;
    }
  },
};

export const gpsService = {
  async getLatestForBus(busId: string): Promise<GpsLog | null> {
    try {
      const { data, error } = await supabase
        .from('gps_logs')
        .select('*')
        .eq('bus_id', busId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? (data as GpsLog) : (MOCK_GPS_LOGS[busId] || null);
    } catch (err) {
      return MOCK_GPS_LOGS[busId] || null;
    }
  },

  async getLatestAll(): Promise<GpsLog[]> {
    try {
      const { data: buses, error: busError } = await supabase.from('buses').select('id');
      if (busError) throw busError;

      const results = await Promise.all(
        (buses ?? []).map((b) => this.getLatestForBus(b.id))
      );
      const filtered = results.filter((g): g is GpsLog => g !== null);
      return filtered.length > 0 ? filtered : Object.values(MOCK_GPS_LOGS);
    } catch (err) {
      return Object.values(MOCK_GPS_LOGS);
    }
  },

  async getHistory(busId: string, limit = 50): Promise<GpsLog[]> {
    try {
      const { data, error } = await supabase
        .from('gps_logs')
        .select('*')
        .eq('bus_id', busId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data && data.length > 0) ? (data as GpsLog[]) : [MOCK_GPS_LOGS[busId]].filter(Boolean);
    } catch (err) {
      return [MOCK_GPS_LOGS[busId]].filter(Boolean);
    }
  },
};

export const seatService = {
  async getLatestForBus(busId: string): Promise<SeatStatus | null> {
    try {
      const { data, error } = await supabase
        .from('seat_status')
        .select('*')
        .eq('bus_id', busId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? (data as SeatStatus) : (MOCK_SEATS[busId] || null);
    } catch (err) {
      return MOCK_SEATS[busId] || null;
    }
  },

  async getLatestAll(): Promise<SeatStatus[]> {
    try {
      const { data: buses, error: busError } = await supabase.from('buses').select('id');
      if (busError) throw busError;

      const results = await Promise.all(
        (buses ?? []).map((b) => this.getLatestForBus(b.id))
      );
      const filtered = results.filter((s): s is SeatStatus => s !== null);
      return filtered.length > 0 ? filtered : Object.values(MOCK_SEATS);
    } catch (err) {
      return Object.values(MOCK_SEATS);
    }
  },
};

export const passengerService = {
  async getLatestForBus(busId: string): Promise<PassengerCount | null> {
    try {
      const { data, error } = await supabase
        .from('passenger_counts')
        .select('*')
        .eq('bus_id', busId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? (data as PassengerCount) : (MOCK_PASSENGERS[busId] || null);
    } catch (err) {
      return MOCK_PASSENGERS[busId] || null;
    }
  },

  async getLatestAll(): Promise<PassengerCount[]> {
    try {
      const { data: buses, error: busError } = await supabase.from('buses').select('id');
      if (busError) throw busError;

      const results = await Promise.all(
        (buses ?? []).map((b) => this.getLatestForBus(b.id))
      );
      const filtered = results.filter((p): p is PassengerCount => p !== null);
      return filtered.length > 0 ? filtered : Object.values(MOCK_PASSENGERS);
    } catch (err) {
      return Object.values(MOCK_PASSENGERS);
    }
  },
};
