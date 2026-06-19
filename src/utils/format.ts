import type { BusStatus, EmergencyStatus } from '@/types';

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

export function formatDuration(minutes: number | null): string {
  if (minutes == null) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatSpeed(speed: number): string {
  return `${Math.round(speed)} km/h`;
}

export function getOccupancyPercentage(occupied: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((occupied / total) * 100);
}

export function getBusStatusLabel(status: BusStatus): string {
  const labels: Record<BusStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    maintenance: 'Maintenance',
    emergency: 'Emergency',
  };
  return labels[status];
}

export function getEmergencyStatusLabel(status: EmergencyStatus): string {
  const labels: Record<EmergencyStatus, string> = {
    active: 'Active',
    resolved: 'Resolved',
    investigating: 'Investigating',
  };
  return labels[status];
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
