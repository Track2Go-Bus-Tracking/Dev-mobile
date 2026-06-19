import { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/utils/format';
import type { NotificationType } from '@/types';

const typeIcons: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  bus_arriving: 'bus',
  delay: 'time',
  emergency: 'warning',
  route_change: 'swap-horizontal',
  system: 'megaphone',
  admin_message: 'mail',
};

const typeColors: Record<NotificationType, string> = {
  bus_arriving: '#166534', // Forest Green
  delay: '#D97706',      // Warm Orange-brown
  emergency: '#EF4444',  // Red
  route_change: '#F97316', // Orange
  system: '#F97316',
  admin_message: '#6B7280',
};

export default function NotificationsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  useEffect(() => {
    if (profile?.id) fetchNotifications(profile.id);
  }, [profile?.id, fetchNotifications]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Alerts & transit announcements</Text>
        </View>
        {notifications.some((n) => !n.read) ? (
          <Pressable onPress={() => profile?.id && markAllAsRead(profile.id)}>
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => profile?.id && fetchNotifications(profile.id)}
            colors={['#F97316']}
          />
        }
      >
        {isLoading && !notifications.length ? (
          <ListSkeleton count={4} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="No notifications"
            message="You'll receive alerts for bus arrivals, delays, and emergencies here."
          />
        ) : (
          notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => markAsRead(notification.id)}
              style={[
                styles.notificationCard,
                notification.read
                  ? styles.readCard
                  : styles.unreadCard
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${typeColors[notification.type]}15` }
                ]}
              >
                <Ionicons
                  name={typeIcons[notification.type]}
                  size={20}
                  color={typeColors[notification.type]}
                />
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.notifTitle}>{notification.title}</Text>
                <Text style={styles.notifBody}>{notification.body}</Text>
                <Text style={styles.notifTime}>
                  {formatDateTime(notification.created_at)}
                </Text>
              </View>
              {!notification.read ? (
                <View style={styles.unreadIndicator} />
              ) : null}
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED', // Warm Cream
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  markAllReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F97316',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 1,
  },
  readCard: {
    borderColor: '#FED7AA',
    backgroundColor: 'white',
  },
  unreadCard: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED', // slight warm tint
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  notifBody: {
    fontSize: 12.5,
    color: '#4B5563',
    marginTop: 3,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 6,
    fontWeight: '500',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
    marginLeft: 8,
    alignSelf: 'center',
  },
});
