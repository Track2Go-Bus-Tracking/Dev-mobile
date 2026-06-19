import { supabase } from './supabase';
import type { TripHistory } from '@/types';

const MOCK_TRIPS: TripHistory[] = [
  {
    id: 't-h-1',
    bus_id: 'b-1',
    driver_id: 'any',
    route: 'CDO ⇄ Manolo Fortich (Poblacion)',
    passenger_count: 22,
    started_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
    duration_minutes: 72,
    status: 'completed',
  },
  {
    id: 't-h-2',
    bus_id: 'b-1',
    driver_id: 'any',
    route: 'Manolo Fortich ⇄ CDO',
    passenger_count: 15,
    started_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 4.9 * 3600 * 1000).toISOString(),
    duration_minutes: 66,
    status: 'completed',
  }
];

export const tripService = {
  async getForDriver(driverId: string): Promise<TripHistory[]> {
    try {
      const { data, error } = await supabase
        .from('trip_history')
        .select('*')
        .eq('driver_id', driverId)
        .order('started_at', { ascending: false });
      if (error) throw error;
      return (data && data.length > 0) ? (data as TripHistory[]) : MOCK_TRIPS;
    } catch (err) {
      console.warn('Failed to load trips for driver from Supabase, using mock trips:', err);
      return MOCK_TRIPS;
    }
  },

  async getForBus(busId: string): Promise<TripHistory[]> {
    try {
      const { data, error } = await supabase
        .from('trip_history')
        .select('*')
        .eq('bus_id', busId)
        .order('started_at', { ascending: false });
      if (error) throw error;
      return (data && data.length > 0) ? (data as TripHistory[]) : MOCK_TRIPS.filter(t => t.bus_id === busId);
    } catch (err) {
      console.warn('Failed to load trips for bus from Supabase, using mock trips:', err);
      return MOCK_TRIPS.filter(t => t.bus_id === busId);
    }
  },

  async createTrip(payload: {
    bus_id: string;
    driver_id: string;
    route: string;
    passenger_count?: number;
  }): Promise<TripHistory> {
    try {
      const { data, error } = await supabase
        .from('trip_history')
        .insert({
          ...payload,
          status: 'in_progress',
          passenger_count: payload.passenger_count ?? 0,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as TripHistory;
    } catch (err) {
      console.warn('Failed to create trip in Supabase, creating local mock only:', err);
      const newMock: TripHistory = {
        id: 'new-mock-trip-' + Math.random().toString(),
        bus_id: payload.bus_id,
        driver_id: payload.driver_id,
        route: payload.route,
        passenger_count: payload.passenger_count ?? 0,
        started_at: new Date().toISOString(),
        ended_at: null,
        duration_minutes: null,
        status: 'in_progress',
      };
      MOCK_TRIPS.unshift(newMock);
      return newMock;
    }
  },

  async completeTrip(tripId: string, passengerCount: number): Promise<TripHistory> {
    try {
      const endedAt = new Date();
      const { data: trip, error: fetchError } = await supabase
        .from('trip_history')
        .select('started_at')
        .eq('id', tripId)
        .single();
      if (fetchError) throw fetchError;

      const startedAt = new Date(trip.started_at);
      const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

      const { data, error } = await supabase
        .from('trip_history')
        .update({
          status: 'completed',
          ended_at: endedAt.toISOString(),
          passenger_count: passengerCount,
          duration_minutes: durationMinutes,
        })
        .eq('id', tripId)
        .select()
        .single();
      if (error) throw error;
      return data as TripHistory;
    } catch (err) {
      console.warn('Failed to complete trip in Supabase, updating local mock only:', err);
      const trip = MOCK_TRIPS.find((t) => t.id === tripId);
      if (trip) {
        trip.status = 'completed';
        trip.ended_at = new Date().toISOString();
        trip.passenger_count = passengerCount;
        trip.duration_minutes = 45; // default mock duration
        return trip;
      }
      throw err;
    }
  },
};
