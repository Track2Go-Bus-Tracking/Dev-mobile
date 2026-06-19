export type UserRole = 'passenger' | 'driver' | 'conductor';

export type BusStatus = 'active' | 'inactive' | 'maintenance' | 'emergency';

export type EmergencyStatus = 'active' | 'resolved' | 'investigating';

export type NotificationType =
  | 'bus_arriving'
  | 'delay'
  | 'emergency'
  | 'route_change'
  | 'system'
  | 'admin_message';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assigned_bus_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Bus {
  id: string;
  bus_number: string;
  plate_number: string;
  route: string;
  driver_name: string;
  status: BusStatus;
  created_at: string;
}

export interface GpsLog {
  id: string;
  bus_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export interface SeatStatus {
  id: string;
  bus_id: string;
  occupied_seats: number;
  available_seats: number;
  total_seats: number;
  seat_map?: boolean[];
  timestamp: string;
}

export interface PassengerCount {
  id: string;
  bus_id: string;
  count: number;
  timestamp: string;
}

export interface EmergencyAlert {
  id: string;
  bus_id: string;
  alert_type: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  status: EmergencyStatus;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TripHistory {
  id: string;
  bus_id: string;
  driver_id: string | null;
  route: string;
  passenger_count: number;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  status: 'completed' | 'in_progress' | 'cancelled';
}

export interface Terminal {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  operating_hours?: string;
  created_at: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: string[];
  created_at: string;
}

export interface BusSchedule {
  id: string;
  route_id: string | null;
  route_name: string;
  departure_time: string;
  arrival_time: string;
  terminal_name: string;
  bus_number: string | null;
  days: string[];
}

export interface BusWithDetails extends Bus {
  gps?: GpsLog;
  seats?: SeatStatus;
  passengers?: PassengerCount;
  eta?: string;
  distanceKm?: number;
}

export interface AuthSession {
  userId: string;
  email: string;
  profile: Profile;
}
