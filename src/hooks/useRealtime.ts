import { useEffect, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { useBusStore } from '@/store/busStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { REALTIME_POLL_INTERVAL_MS } from '@/utils/constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

const REALTIME_TABLES = [
  'buses',
  'gps_logs',
  'seat_status',
  'passenger_counts',
  'emergency_alerts',
  'notifications',
] as const;

export function useRealtime() {
  const fetchAll = useBusStore((s) => s.fetchAll);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const profile = useAuthStore((s) => s.profile);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    fetchAll();

    const pollInterval = setInterval(fetchAll, REALTIME_POLL_INTERVAL_MS);

    REALTIME_TABLES.forEach((table) => {
      const channel = supabase
        .channel(`mobile-${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            fetchAll();
            if (table === 'notifications' && profile?.id) {
              fetchNotifications(profile.id);
            }
          }
        )
        .subscribe();

      channelsRef.current.push(channel);
    });

    return () => {
      clearInterval(pollInterval);
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [fetchAll, fetchNotifications, profile?.id]);
}

export function useRealtimeBus(busId: string | undefined) {
  const fetchBusDetails = useBusStore((s) => s.fetchBusDetails);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    if (!busId) return;

    fetchBusDetails(busId);

    const tables = ['gps_logs', 'seat_status', 'passenger_counts', 'buses'] as const;
    tables.forEach((table) => {
      const channel = supabase
        .channel(`mobile-bus-${busId}-${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table, filter: `bus_id=eq.${busId}` },
          () => fetchBusDetails(busId)
        )
        .subscribe();
      channelsRef.current.push(channel);
    });

    const pollInterval = setInterval(() => fetchBusDetails(busId), REALTIME_POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollInterval);
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [busId, fetchBusDetails]);
}
