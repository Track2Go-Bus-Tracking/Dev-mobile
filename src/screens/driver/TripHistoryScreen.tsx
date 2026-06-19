import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { tripService } from '@/services/tripService';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, formatDuration } from '@/utils/format';
import type { TripHistory } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function TripHistoryScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [trips, setTrips] = useState<TripHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) loadTrips();
  }, [profile?.id]);

  async function loadTrips() {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      const data = await tripService.getForDriver(profile.id);
      setTrips(data);
    } catch {
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trip Log History</Text>
          <Text style={styles.headerSubtitle}>Completed route records and performance</Text>
        </View>

        {isLoading ? (
          <ListSkeleton count={4} />
        ) : trips.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No past trips recorded"
            message="Completed trips with passenger numbers will show up here."
          />
        ) : (
          trips.map((trip) => {
            const isCompleted = trip.status === 'completed';
            return (
              <Card key={trip.id} className="mb-4 border-[#FED7AA]">
                <View style={styles.cardHeader}>
                  <View style={styles.routeContainer}>
                    <Ionicons name="git-commit" size={16} color="#F97316" style={{ marginRight: 6 }} />
                    <Text style={styles.routeText}>{trip.route}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isCompleted ? styles.statusBadgeCompleted : styles.statusBadgeProgress
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isCompleted ? styles.statusTextCompleted : styles.statusTextProgress
                      ]}
                    >
                      {trip.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsDivider} />

                <View style={styles.statsGrid}>
                  <View style={styles.statColumn}>
                    <Text style={styles.statLabel}>STARTED AT</Text>
                    <Text style={styles.statValue}>
                      {formatDateTime(trip.started_at)}
                    </Text>
                  </View>
                  
                  <View style={styles.statColumnRight}>
                    <Text style={styles.statLabelRight}>DURATION</Text>
                    <Text style={styles.statValueRight}>
                      {formatDuration(trip.duration_minutes)}
                    </Text>
                  </View>
                </View>

                <View style={styles.passengerRow}>
                  <Ionicons name="people-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                  <Text style={styles.passengerText}>
                    Passengers Checked: <Text style={styles.passengerCount}>{trip.passenger_count}</Text>
                  </Text>
                </View>
              </Card>
            );
          })
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 16,
    paddingLeft: 4,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  routeText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusBadgeProgress: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusTextCompleted: {
    color: '#166534',
  },
  statusTextProgress: {
    color: '#F97316',
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#FFF7ED',
    marginVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
  },
  statColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  statLabelRight: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 2,
  },
  statValueRight: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignSelf: 'flex-start',
  },
  passengerText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  passengerCount: {
    fontWeight: '700',
    color: '#F97316',
  },
});
