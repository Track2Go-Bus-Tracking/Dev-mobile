import { supabase } from './supabase';
import type { BusSchedule } from '@/types';

const FALLBACK_SCHEDULES: BusSchedule[] = [
  {
    id: '1',
    route_id: null,
    route_name: 'CDO → Manolo Fortich',
    departure_time: '06:00',
    arrival_time: '07:30',
    terminal_name: 'CDO Central Terminal',
    bus_number: 'BUS-001',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: '2',
    route_id: null,
    route_name: 'CDO → Manolo Fortich',
    departure_time: '08:00',
    arrival_time: '09:30',
    terminal_name: 'CDO Central Terminal',
    bus_number: 'BUS-002',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  {
    id: '3',
    route_id: null,
    route_name: 'CDO → Manolo Fortich',
    departure_time: '12:00',
    arrival_time: '13:30',
    terminal_name: 'CDO Central Terminal',
    bus_number: 'BUS-003',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: '4',
    route_id: null,
    route_name: 'Manolo Fortich → CDO',
    departure_time: '07:00',
    arrival_time: '08:30',
    terminal_name: 'Manolo Fortich Terminal',
    bus_number: 'BUS-001',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
];

export const scheduleService = {
  async getAll(): Promise<BusSchedule[]> {
    const { data, error } = await supabase
      .from('bus_schedules')
      .select('*')
      .order('departure_time');

    if (error || !data?.length) return FALLBACK_SCHEDULES;
    return data as BusSchedule[];
  },

  async getByRoute(routeName: string): Promise<BusSchedule[]> {
    const all = await this.getAll();
    if (!routeName.trim()) return all;
    return all.filter((s) =>
      s.route_name.toLowerCase().includes(routeName.toLowerCase())
    );
  },

  async getRoutes(): Promise<string[]> {
    const schedules = await this.getAll();
    return [...new Set(schedules.map((s) => s.route_name))];
  },
};
