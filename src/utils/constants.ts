export const COLORS = {
  primary: '#F97316',     // Orange
  secondary: '#FB923C',   // Light Orange
  accent: '#166534',      // Forest Green
  background: '#FFF7ED',  // Warm Cream
  surface: '#FFFFFF',
  text: '#1F2937',        // Dark Slate
  textMuted: '#6B7280',
  border: '#FED7AA',      // Soft orange-cream border
  success: '#166534',     // Forest Green
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

export const REALTIME_POLL_INTERVAL_MS = 5000;

export const DEFAULT_TOTAL_SEATS = 22;

export const APP_NAME = 'Track2Go';

export const DRIVER_ROLES = ['driver', 'conductor'] as const;

export const PASSENGER_ROLE = 'passenger' as const;
