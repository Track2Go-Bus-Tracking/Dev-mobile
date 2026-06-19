import { useMemo, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, TextInput, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBusStore } from '@/store/busStore';
import { useUserLocation } from '@/hooks/useLocation';
import { Card } from '@/components/ui/Card';
import { StatusBadge, StatItem } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getDistanceKm, estimateEtaMinutes, formatEta } from '@/utils/geo';
import { getOccupancyPercentage } from '@/utils/format';
import { DEFAULT_TOTAL_SEATS } from '@/utils/constants';
import type { PassengerStackParamList, PassengerTabParamList } from '@/types/navigation';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BusMap } from '@/components/maps/BusMap';

type Nav = NativeStackNavigationProp<PassengerStackParamList> &
  BottomTabNavigationProp<PassengerTabParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { busDetails, emergencies, isLoading, error, fetchAll } = useBusStore();
  const { location } = useUserLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Stats calculation
  const stats = useMemo(() => {
    const activeBuses = busDetails.filter((b) => b.status === 'active');
    const totalPassengers = activeBuses.reduce(
      (acc, curr) => acc + (curr.passengers?.count ?? curr.seats?.occupied_seats ?? 0),
      0
    );
    const activeEmergencies = emergencies.filter((e) => e.status === 'active').length;
    // Mock delayed count based on speed or static conditions
    const delayedTrips = busDetails.filter((b) => b.gps && b.gps.speed > 0 && b.gps.speed < 15).length;

    return {
      activeCount: activeBuses.length,
      passengerCount: totalPassengers,
      emergencyCount: activeEmergencies,
      delayedCount: delayedTrips,
    };
  }, [busDetails, emergencies]);

  // Nearest Bus memo
  const nearestBus = useMemo(() => {
    if (!busDetails.length) return null;

    const withDistance = busDetails
      .filter((b) => b.gps && b.status === 'active')
      .map((bus) => {
        const distanceKm =
          location && bus.gps
            ? getDistanceKm(
                location.latitude,
                location.longitude,
                bus.gps.latitude,
                bus.gps.longitude
              )
            : Infinity;
        const etaMin = estimateEtaMinutes(distanceKm, bus.gps?.speed ?? 30);
        return { ...bus, distanceKm, eta: formatEta(etaMin) };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return withDistance[0] ?? busDetails[0];
  }, [busDetails, location]);

  const filteredBuses = useMemo(() => {
    return busDetails.filter((b) => 
      b.bus_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [busDetails, searchQuery]);

  if (error && !busDetails.length) {
    return <ErrorState message={error} onRetry={fetchAll} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAll} colors={['#F97316']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Banner Gradient */}
        <LinearGradient
          colors={['#F97316', '#FB923C']}
          style={styles.welcomeBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.welcomeHeaderRow}>
            <View>
              <Text style={styles.welcomeTitle}>Maayong Adlaw!</Text>
              <Text style={styles.welcomeSubtitle}>Track2Go Manolo Fortich</Text>
            </View>
            <Pressable 
              onPress={() => navigation.navigate('Notifications')}
              style={styles.notificationIconBadge}
            >
              <Ionicons name="notifications-outline" size={24} color="white" />
              {stats.emergencyCount > 0 && <View style={styles.dotBadge} />}
            </Pressable>
          </View>

          {/* Search Box inside Welcome Card */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search bus number, route, or driver..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>
        </LinearGradient>

        <View style={styles.bodyContent}>
          {/* Real-time Bus Tracking Overview (4 grid cards) */}
          <Text style={styles.sectionHeader}>Tracking Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="bus" size={20} color="#F97316" />
              </View>
              <Text style={styles.statNumber}>{stats.activeCount}</Text>
              <Text style={styles.statLabel}>Active Buses</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="people" size={20} color="#166534" />
              </View>
              <Text style={styles.statNumber}>{stats.passengerCount}</Text>
              <Text style={styles.statLabel}>Onboard</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time" size={20} color="#D97706" />
              </View>
              <Text style={styles.statNumber}>{stats.delayedCount}</Text>
              <Text style={styles.statLabel}>Delayed Trips</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: stats.emergencyCount > 0 ? '#FEF2F2' : '#F3F4F6' }]}>
                <Ionicons name="alert-circle" size={20} color={stats.emergencyCount > 0 ? '#EF4444' : '#6B7280'} />
              </View>
              <Text style={[styles.statNumber, stats.emergencyCount > 0 ? { color: '#EF4444' } : null]}>
                {stats.emergencyCount}
              </Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
          </View>

          {/* Quick Actions (Floating Pill layout) */}
          <Text style={styles.sectionHeader}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <Pressable 
              onPress={() => navigation.navigate('LiveTracking')} 
              style={[styles.quickActionPill, { borderColor: '#F97316' }]}
            >
              <LinearGradient colors={['#FFF7ED', '#FED7AA']} style={styles.quickActionGradient}>
                <Ionicons name="navigate-circle" size={24} color="#F97316" />
                <Text style={[styles.quickActionText, { color: '#F97316' }]}>Live Map</Text>
              </LinearGradient>
            </Pressable>

            <Pressable 
              onPress={() => navigation.navigate('Schedule')} 
              style={[styles.quickActionPill, { borderColor: '#166534' }]}
            >
              <LinearGradient colors={['#F0FDF4', '#BBF7D0']} style={styles.quickActionGradient}>
                <Ionicons name="calendar-outline" size={24} color="#166534" />
                <Text style={[styles.quickActionText, { color: '#166534' }]}>Schedules</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Emergency Alert Banner if present */}
          {stats.emergencyCount > 0 && (
            <Pressable 
              onPress={() => navigation.navigate('Notifications')}
              style={styles.emergencyCard}
            >
              <View style={styles.emergencyHeader}>
                <Ionicons name="warning" size={22} color="#EF4444" />
                <Text style={styles.emergencyTitle}>Active Emergency Incident</Text>
              </View>
              <Text style={styles.emergencyBody}>
                A mechanical warning alert has been triggered on Dahilayan Route. Tap to see routing updates.
              </Text>
            </Pressable>
          )}

          {/* Live Mini GPS Tracking Map Card */}
          <Text style={styles.sectionHeader}>Interactive Route Map</Text>
          <View style={styles.mapCard}>
            <BusMap
              gps={nearestBus?.gps}
              userLatitude={location?.latitude}
              userLongitude={location?.longitude}
              height={220}
            />
            <View style={styles.mapCardFooter}>
              <View>
                <Text style={styles.mapFooterTitle}>Manolo Fortich Route Network</Text>
                <Text style={styles.mapFooterSubtitle}>Showing live tracking vectors & terminals</Text>
              </View>
              <Pressable 
                onPress={() => navigation.navigate('LiveTracking')}
                style={styles.mapFooterButton}
              >
                <Text style={styles.mapFooterButtonText}>Fullscreen</Text>
              </Pressable>
            </View>
          </View>

          {/* Nearest Bus arrival details card */}
          {nearestBus ? (
            <Card 
              className="mb-6 border-[#FED7AA]" 
              title="Nearest Arrival Estimator"
              subtitle={`${nearestBus.bus_number} ⇄ Driver: ${nearestBus.driver_name}`}
            >
              <View style={styles.nearestContainer}>
                <View style={styles.nearestSubRow}>
                  <Ionicons name="analytics-outline" size={20} color="#F97316" />
                  <Text style={styles.nearestTextRoute}>{nearestBus.route}</Text>
                </View>
                <View style={styles.nearestGrid}>
                  <View style={styles.nearestStat}>
                    <Text style={styles.nearestStatLabel}>ETA</Text>
                    <Text style={styles.nearestStatValHighlight}>{nearestBus.eta ?? 'Calculating...'}</Text>
                  </View>
                  <View style={styles.nearestStat}>
                    <Text style={styles.nearestStatLabel}>Available Seats</Text>
                    <Text style={styles.nearestStatValSuccess}>
                      {nearestBus.seats?.available_seats ?? DEFAULT_TOTAL_SEATS}
                    </Text>
                  </View>
                  <View style={styles.nearestStat}>
                    <Text style={styles.nearestStatLabel}>Occupancy</Text>
                    <Text style={styles.nearestStatVal}>
                      {getOccupancyPercentage(
                        nearestBus.seats?.occupied_seats ?? nearestBus.passengers?.count ?? 0,
                        nearestBus.seats?.total_seats ?? DEFAULT_TOTAL_SEATS
                      )}%
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ) : null}

          {/* Active Buses Card list (Modern table inside rounded container) */}
          <Text style={styles.sectionHeader}>Active Buses Status</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Bus</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Route / Driver</Text>
              <Text style={styles.tableHeaderCell}>Capacity</Text>
              <Text style={styles.tableHeaderCell}>Status</Text>
            </View>

            {isLoading && !busDetails.length ? (
              <ListSkeleton count={3} />
            ) : filteredBuses.length > 0 ? (
              filteredBuses.map((bus, idx) => {
                const occupied = bus.seats?.occupied_seats ?? bus.passengers?.count ?? 0;
                const total = bus.seats?.total_seats ?? DEFAULT_TOTAL_SEATS;
                return (
                  <Pressable
                    key={bus.id}
                    onPress={() => navigation.navigate('BusInformation', { busId: bus.id })}
                    style={[
                      styles.tableRow,
                      idx === filteredBuses.length - 1 ? { borderBottomWidth: 0 } : null,
                    ]}
                  >
                    <Text style={styles.busNumberCell}>{bus.bus_number}</Text>
                    <View style={{ flex: 2, paddingRight: 4 }}>
                      <Text style={styles.routeCellText} numberOfLines={1}>
                        {bus.route}
                      </Text>
                      <Text style={styles.driverCellText}>{bus.driver_name}</Text>
                    </View>
                    <Text style={styles.capacityCell}>
                      {occupied}/{total}
                    </Text>
                    <View>
                      <StatusBadge status={bus.status} />
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyTable}>
                <Text style={styles.emptyTableText}>No matching buses found</Text>
              </View>
            )}
          </View>

          {/* Recent Activity Timeline */}
          <Text style={styles.sectionHeader}>Recent Activity Timeline</Text>
          <View style={styles.timelineContainer}>
            <TimelineItem
              icon="checkmark-circle"
              color="#166534"
              time="10 mins ago"
              title="CDO ⇄ Manolo Fortich (BUS-101) Departed"
              description="Departed CDO Agora Central Terminal. Next stop: Puerto."
              isFirst
            />
            <TimelineItem
              icon="time"
              color="#D97706"
              time="25 mins ago"
              title="Dahilayan Route Minor Delay"
              description="BUS-103 is running 8 mins behind schedule due to mountain fog."
            />
            <TimelineItem
              icon="alert-circle"
              color="#EF4444"
              time="1 hour ago"
              title="Emergency Resolved (Camp Phillips)"
              description="BUS-104 battery warning checked and resolved by response team."
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineItem({
  icon,
  color,
  time,
  title,
  description,
  isFirst,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  time: string;
  title: string;
  description: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineIndicatorColumn}>
        <View style={[styles.timelineLine, isFirst ? { height: '50%', top: '50%' } : isLast ? { height: '50%', top: 0 } : null]} />
        <View style={[styles.timelineDot, { backgroundColor: color }]}>
          <Ionicons name={icon} size={12} color="white" />
        </View>
      </View>
      <View style={styles.timelineContentColumn}>
        <Text style={styles.timelineTime}>{time}</Text>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED', // Warm Cream background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeBanner: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  notificationIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    padding: 0,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
    paddingLeft: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionPill: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 6,
  },
  emergencyBody: {
    fontSize: 12,
    color: '#EF4444',
    lineHeight: 16,
  },
  mapCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  mapCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFF7ED',
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
  },
  mapFooterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  mapFooterSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  mapFooterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F97316',
  },
  mapFooterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  nearestContainer: {
    marginTop: 4,
  },
  nearestSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  nearestTextRoute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  nearestGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  nearestStat: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  nearestStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  nearestStatValHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F97316',
    marginTop: 2,
  },
  nearestStatValSuccess: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 2,
  },
  nearestStatVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 2,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF7ED',
  },
  busNumberCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
  },
  routeCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  driverCellText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  capacityCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  emptyTable: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyTableText: {
    fontSize: 13,
    color: '#6B7280',
  },
  timelineContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIndicatorColumn: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#FED7AA',
    height: '100%',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineContentColumn: {
    flex: 1,
    marginLeft: 12,
  },
  timelineTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  timelineDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
});
