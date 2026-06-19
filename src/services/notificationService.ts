import { supabase } from './supabase';
import type { Notification, NotificationType } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/utils/mockData';

export const notificationService = {
  async getForUser(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data && data.length > 0) ? (data as Notification[]) : MOCK_NOTIFICATIONS as unknown as Notification[];
    } catch (err) {
      console.warn('Failed to load notifications from Supabase, using mock notifications:', err);
      return MOCK_NOTIFICATIONS as unknown as Notification[];
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      const mock = MOCK_NOTIFICATIONS.find((n) => n.id === id);
      if (mock) mock.read = true;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      if (error) throw error;
    } catch (err) {
      MOCK_NOTIFICATIONS.forEach((n) => {
        n.read = true;
      });
    }
  },

  async create(payload: {
    user_id: string;
    title: string;
    body: string;
    type: NotificationType;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({ ...payload, read: false })
        .select()
        .single();
      if (error) throw error;
      return data as Notification;
    } catch (err) {
      const newMockNotification = {
        id: 'mock-notif-' + Math.random().toString(),
        user_id: payload.user_id,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        read: false,
        metadata: payload.metadata || {},
        created_at: new Date().toISOString(),
      };
      MOCK_NOTIFICATIONS.unshift(newMockNotification);
      return newMockNotification as unknown as Notification;
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      if (error) throw error;
      return count ?? 0;
    } catch (err) {
      return MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
    }
  },
};
