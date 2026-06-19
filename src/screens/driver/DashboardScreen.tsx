import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import { useBusStore } from '@/store/busStore';
import { Card } from '@/components/ui/Card';
import { QuickActionCard, StatusBadge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getOccupancyPercentage } from '@/utils/format';
import { DEFAULT_TOTAL_SEATS } from '@/utils/constants';
import type { DriverTabParamList } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<DriverTabParamList>>();
  const profile = useAuthStore((s) => s.profile);
  const { busDetails, emergencies, isLoading, error, fetchAll } = useBusStore();

  const assignedBus = useMemo(() => {
    if (profile?.assigned_bus_id) {
      return busDetails.find((b) => b.id === profile.assigned_bus_id);
    }
    return busDetails.find((b) => b.driver_name === profile?.name) ?? busDetails[0];
  }, [busDetails, profile]);

  const activeEmergency = emergencies.find(
    (e) => e.bus_id === assignedBus?.id && e.status === 'active'
  );
  const passengers = assignedBus?.passengers?.count ?? assignedBus?.seats?.occupied_seats ?? 0;
  const available = assignedBus?.seats?.available_seats ?? DEFAULT_TOTAL_SEATS - passengers;
  const total = assignedBus?.seats?.total_seats ?? DEFAULT_TOTAL_SEATS;
  const occupancy = getOccupancyPercentage(passengers, total);

  if (error && !busDetails.length) {
    return <ErrorState message={error} onRetry={fetchAll} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchAll}
            colors={['#F97316']}
            tintColor="#F97316"
          />
        }
      >
        {/* Welcome Gradient Banner */}
        <LinearGradient
          colors={['#F97316', '#FB923C']}
          style={styles.welcomeBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.welcomeRow}>
            <View>
              <Text style={styles.welcomeGreeting}>Driver Dashboard</Text>
              <Text style={styles.welcomeName}>
                {profile?.name ?? 'Operator'}
              </Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {profile?.name?.charAt(0)?.toUpperCase() ?? 'D'}
              </Text>
            </View>
          </View>

          {/* Quick stat chips */}
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Ionicons name="people" size={14} color="#F97316" />
              <Text style={styles.chipText}>{passengers} onboard</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="speedometer-outline" size={14} color="#F97316" />
              <Text style={styles.chipText}>
                {assignedBus?.gps?.speed ? `${Math.round(assignedBus.gps.speed)} km/h` : 'No GPS'}
              </Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="bus-outline" size={14} color="#F97316" />
              <Text style={styles.chipText}>
                {assignedBus?.bus_number ?? 'No bus'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Emergency Alert Banner */}
          {activeEmergency ? (
            <Pressable
              onPress={() => navigation.navigate('Emergency')}
              style={styles.emergencyBanner}
            >
              <Ionicons name="warning" size={20} color="#EF4444" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.emergencyTitle}>Active Emergency Alert</Text>
                <Text style={styles.emergencyTime}>
                  Triggered at {new Date(activeEmergency.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" />
            </Pressable>
          ) : null}

          {/* Current Trip Card */}
          <Text style={styles.sectionTitle}>Current Trip Status</Text>
          {isLoading && !assignedBus ? (
            <ListSkeleton count={2} />
          ) : (
            <Card style={styles.tripCard}>
              {assignedBus ? (
                <>
                  {/* Bus header */}
                  <View style={styles.tripHeader}>
                    <View>
                      <Text style={styles.busNumber}>{assignedBus.bus_number}</Text>
                      <Text style={styles.plateText}>{assignedBus.plate_number}</Text>
                    </View>
                    <StatusBadge status={assignedBus.status} />
                  </View>

                  <View style={styles.routeRow}>
                    <Ionicons name="git-commit-outline" size={16} color="#F97316" />
                    <Text style={styles.routeText}>{assignedBus.route}</Text>
                  </View>

                  {/* Metrics row */}
                  <View style={styles.metricsRow}>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricValue}>{passengers}</Text>
                      <Text style={styles.metricLabel}>Passengers</Text>
                    </View>
                    <View style={[styles.metricBox, styles.metricBoxGreen]}>
                      <Text style={[styles.metricValue, { color: '#166534' }]}>{available}</Text>
                      <Text style={styles.metricLabel}>Available</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricValue}>{occupancy}%</Text>
                      <Text style={styles.metricLabel}>Occupancy</Text>
                    </View>
                  </View>

                  {/* Occupancy bar */}
                  <View style={styles.occupancyBarBg}>
                    <View
                      style={[
                        styles.occupancyBarFill,
                        {
                          width: `${occupancy}%`,
                          backgroundColor: occupancy > 85 ? '#EF4444' : '#F97316',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.occupancyHint}>
                    {occupancy > 85
                      ? 'Bus is near capacity'
                      : `${available} seats remaining`}
                  </Text>
                </>
              ) : (
                <View style={styles.noBusContainer}>
                  <Ionicons name="bus-outline" size={32} color="#FED7AA" />
                  <Text style={styles.noBusText}>No bus assigned to your account</Text>
                </View>
              )}
            </Card>
          )}

          {/* Quick Actions Grid */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Passenger Counter"
              subtitle="IoT live stream"
              icon="people"
              color="#F97316"
              onPress={() => navigation.navigate('PassengerCounter')}
            />
            <QuickActionCard
              title="Emergency SOS"
              subtitle="Panic broadcast"
              icon="warning"
              color="#EF4444"
              onPress={() => navigation.navigate('Emergency')}
            />
            <QuickActionCard
              title="Trip History"
              subtitle="Past records"
              icon="time"
              color="#166534"
              onPress={() => navigation.navigate('TripHistory')}
            />
            <QuickActionCard
              title="My Profile"
              subtitle="Assignment info"
              icon="person-circle-outline"
              color="#6B7280"
              onPress={() => navigation.navigate('Profile')}
            />
          </View>

          {/* Recent System Activity */}
          <Text style={styles.sectionTitle}>System Activity</Text>
          <Card>
            <ActivityRow
              icon="checkmark-circle"
              color="#166534"
              label="IoT sensor data synced successfully"
              time="Just now"
              isFirst
            />
            <ActivityRow
              icon="navigate"
              color="#F97316"
              label={`GPS lock acquired — ${assignedBus?.bus_number ?? 'BUS-101'}`}
              time="2 min ago"
            />
            <ActivityRow
              icon="people-outline"
              color="#6B7280"
              label="Passenger count updated from counter"
              time="5 min ago"
              isLast
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivityRow({
  icon,
  color,
  label,
  time,
  isFirst,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  time: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[actStyles.row, !isLast && actStyles.border]}>
      <View style={[actStyles.iconDot, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={15} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={actStyles.label}>{label}</Text>
        <Text style={actStyles.time}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeBanner: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeGreeting: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginTop: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F97316',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
    paddingLeft: 2,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  emergencyTime: {
    fontSize: 11,
    color: '#EF4444',
    opacity: 0.8,
    marginTop: 1,
  },
  tripCard: {
    marginBottom: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  busNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  plateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 10,
    alignItems: 'center',
  },
  metricBoxGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F97316',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  occupancyBarBg: {
    height: 8,
    backgroundColor: '#FED7AA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  occupancyHint: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  noBusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noBusText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

const actStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFF7ED',
  },
  iconDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1F2937',
  },
  time: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
});
