import type { Bus, BusWithDetails, Terminal, BusSchedule, GpsLog, SeatStatus, PassengerCount, EmergencyAlert } from '@/types';

// Manolo Fortich Region Coordinates
export const COORDINATES = {
  cdoTerminal: { latitude: 8.4862, longitude: 124.6617 },
  manoloFortichTerminal: { latitude: 8.3608, longitude: 124.8622 },
  campPhillips: { latitude: 8.3370, longitude: 124.8465 },
  dahilayanPark: { latitude: 8.2144, longitude: 124.8714 },
  libona: { latitude: 8.3975, longitude: 124.7745 }
};

export const MOCK_TERMINALS: Terminal[] = [
  {
    id: 't-1',
    name: 'Manolo Fortich Central Terminal',
    location: 'Poblacion, Manolo Fortich, Bukidnon',
    latitude: COORDINATES.manoloFortichTerminal.latitude,
    longitude: COORDINATES.manoloFortichTerminal.longitude,
    operating_hours: '4:00 AM – 10:00 PM',
    created_at: new Date().toISOString(),
  },
  {
    id: 't-2',
    name: 'CDO Agora Central Terminal',
    location: 'Agora, Cagayan de Oro City',
    latitude: COORDINATES.cdoTerminal.latitude,
    longitude: COORDINATES.cdoTerminal.longitude,
    operating_hours: '24 Hours Open',
    created_at: new Date().toISOString(),
  },
  {
    id: 't-3',
    name: 'Camp Phillips Transit Point',
    location: 'Camp Phillips, Manolo Fortich, Bukidnon',
    latitude: COORDINATES.campPhillips.latitude,
    longitude: COORDINATES.campPhillips.longitude,
    operating_hours: '6:00 AM – 8:00 PM',
    created_at: new Date().toISOString(),
  },
  {
    id: 't-4',
    name: 'Dahilayan Adventure Hub Station',
    location: 'Dahilayan, Manolo Fortich, Bukidnon',
    latitude: COORDINATES.dahilayanPark.latitude,
    longitude: COORDINATES.dahilayanPark.longitude,
    operating_hours: '7:00 AM – 6:00 PM',
    created_at: new Date().toISOString(),
  }
];

export const MOCK_BUSES: Bus[] = [
  {
    id: 'b-1',
    bus_number: 'BUS-101',
    plate_number: 'KAA-4592',
    route: 'CDO ⇄ Manolo Fortich (Poblacion)',
    driver_name: 'Juan Dela Cruz',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b-2',
    bus_number: 'BUS-102',
    plate_number: 'KAB-8721',
    route: 'Camp Phillips ⇄ Poblacion ⇄ CDO',
    driver_name: 'Mario Rossi',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b-3',
    bus_number: 'BUS-103',
    plate_number: 'KAC-1049',
    route: 'Dahilayan ⇄ Poblacion Shuttle',
    driver_name: 'Roberto Santos',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b-4',
    bus_number: 'BUS-104',
    plate_number: 'KAD-3312',
    route: 'CDO ⇄ Manolo Fortich (Express)',
    driver_name: 'Santi Alvarez',
    status: 'maintenance',
    created_at: new Date().toISOString(),
  }
];

export const MOCK_GPS_LOGS: Record<string, GpsLog> = {
  'b-1': {
    id: 'gps-1',
    bus_id: 'b-1',
    latitude: 8.4120, // Heading towards MF from CDO
    longitude: 124.7510,
    speed: 55,
    timestamp: new Date().toISOString(),
  },
  'b-2': {
    id: 'gps-2',
    bus_id: 'b-2',
    latitude: 8.3450, // Near Camp Phillips
    longitude: 124.8510,
    speed: 40,
    timestamp: new Date().toISOString(),
  },
  'b-3': {
    id: 'gps-3',
    bus_id: 'b-3',
    latitude: 8.2810, // Climbing to Dahilayan
    longitude: 124.8690,
    speed: 35,
    timestamp: new Date().toISOString(),
  },
  'b-4': {
    id: 'gps-4',
    bus_id: 'b-4',
    latitude: COORDINATES.manoloFortichTerminal.latitude,
    longitude: COORDINATES.manoloFortichTerminal.longitude,
    speed: 0,
    timestamp: new Date().toISOString(),
  }
};

export const MOCK_SEATS: Record<string, SeatStatus> = {
  'b-1': {
    id: 'seat-1',
    bus_id: 'b-1',
    occupied_seats: 12,
    available_seats: 10,
    total_seats: 22,
    seat_map: [true, true, false, false, true, true, false, true, true, false, false, true, false, true, true, false, true, false, true, false, true, false],
    timestamp: new Date().toISOString(),
  },
  'b-2': {
    id: 'seat-2',
    bus_id: 'b-2',
    occupied_seats: 18,
    available_seats: 4,
    total_seats: 22,
    seat_map: [true, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, false, true, false, true, true],
    timestamp: new Date().toISOString(),
  },
  'b-3': {
    id: 'seat-3',
    bus_id: 'b-3',
    occupied_seats: 6,
    available_seats: 16,
    total_seats: 22,
    seat_map: [true, false, false, false, true, false, false, true, false, false, false, true, false, false, true, false, false, false, true, false, false, false],
    timestamp: new Date().toISOString(),
  },
  'b-4': {
    id: 'seat-4',
    bus_id: 'b-4',
    occupied_seats: 0,
    available_seats: 22,
    total_seats: 22,
    seat_map: Array(22).fill(false),
    timestamp: new Date().toISOString(),
  }
};

export const MOCK_PASSENGERS: Record<string, PassengerCount> = {
  'b-1': { id: 'pc-1', bus_id: 'b-1', count: 12, timestamp: new Date().toISOString() },
  'b-2': { id: 'pc-2', bus_id: 'b-2', count: 18, timestamp: new Date().toISOString() },
  'b-3': { id: 'pc-3', bus_id: 'b-3', count: 6, timestamp: new Date().toISOString() },
  'b-4': { id: 'pc-4', bus_id: 'b-4', count: 0, timestamp: new Date().toISOString() }
};

export const MOCK_BUS_DETAILS: BusWithDetails[] = MOCK_BUSES.map(bus => ({
  ...bus,
  gps: MOCK_GPS_LOGS[bus.id],
  seats: MOCK_SEATS[bus.id],
  passengers: MOCK_PASSENGERS[bus.id],
  eta: bus.id === 'b-1' ? '18 mins' : bus.id === 'b-2' ? '8 mins' : bus.id === 'b-3' ? '25 mins' : undefined,
  distanceKm: bus.id === 'b-1' ? 9.8 : bus.id === 'b-2' ? 3.4 : bus.id === 'b-3' ? 14.2 : undefined,
}));

export const MOCK_SCHEDULES: BusSchedule[] = [
  {
    id: 's-1',
    route_id: 'r-1',
    route_name: 'CDO ⇄ Manolo Fortich (Poblacion)',
    departure_time: '05:30 AM',
    arrival_time: '06:45 AM',
    terminal_name: 'CDO Agora Central Terminal',
    bus_number: 'BUS-101',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: 's-2',
    route_id: 'r-1',
    route_name: 'CDO ⇄ Manolo Fortich (Poblacion)',
    departure_time: '07:00 AM',
    arrival_time: '08:15 AM',
    terminal_name: 'CDO Agora Central Terminal',
    bus_number: 'BUS-104',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    id: 's-3',
    route_id: 'r-2',
    route_name: 'Camp Phillips ⇄ Poblacion ⇄ CDO',
    departure_time: '06:00 AM',
    arrival_time: '07:30 AM',
    terminal_name: 'Camp Phillips Transit Point',
    bus_number: 'BUS-102',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  {
    id: 's-4',
    route_id: 'r-3',
    route_name: 'Dahilayan ⇄ Poblacion Shuttle',
    departure_time: '08:00 AM',
    arrival_time: '08:45 AM',
    terminal_name: 'Dahilayan Adventure Hub Station',
    bus_number: 'BUS-103',
    days: ['Fri', 'Sat', 'Sun'],
  },
  {
    id: 's-5',
    route_id: 'r-1',
    route_name: 'Manolo Fortich ⇄ CDO',
    departure_time: '05:00 PM',
    arrival_time: '06:15 PM',
    terminal_name: 'Manolo Fortich Central Terminal',
    bus_number: 'BUS-101',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n-1',
    user_id: 'any',
    title: 'Bus BUS-102 Arriving Soon',
    body: 'BUS-102 is about 2.5 km away and will reach Camp Phillips in approximately 5 minutes.',
    type: 'bus_arriving' as const,
    read: false,
    metadata: { bus_id: 'b-2' },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'n-2',
    user_id: 'any',
    title: 'Schedule Change: Dahilayan Shuttle',
    body: 'Starting next week, Friday schedules will start at 7:30 AM instead of 8:00 AM.',
    type: 'route_change' as const,
    read: true,
    metadata: {},
    created_at: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
  },
  {
    id: 'n-3',
    user_id: 'any',
    title: 'Heavy Traffic on Route CDO-MF',
    body: 'Minor delays of 10-15 minutes expected near Puerto junction due to road construction.',
    type: 'delay' as const,
    read: false,
    metadata: {},
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  }
];

export const MOCK_EMERGENCIES: EmergencyAlert[] = [
  {
    id: 'e-1',
    bus_id: 'b-3',
    alert_type: 'Mechanical Issue (Engine Overheat)',
    latitude: 8.2345,
    longitude: 124.8701,
    image_url: null,
    status: 'investigating',
    timestamp: new Date().toISOString(),
  }
];
