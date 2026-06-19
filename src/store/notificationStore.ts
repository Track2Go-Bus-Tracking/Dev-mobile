import { create } from 'zustand';
import type { Notification } from '@/types';
import { notificationService } from '@/services/notificationService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationService.getForUser(userId),
        notificationService.getUnreadCount(userId),
      ]);
      set({ notifications, unreadCount, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load notifications',
        isLoading: false,
      });
    }
  },

  markAsRead: async (id) => {
    await notificationService.markAsRead(id);
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  },

  markAllAsRead: async (userId) => {
    await notificationService.markAllAsRead(userId);
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },
}));
