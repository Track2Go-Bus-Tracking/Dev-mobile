import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBusStore } from '@/store/busStore';
import { useRealtimeBus } from '@/hooks/useRealtime';
import { useUserLocation } from '@/hooks/useLocation';
import { BusMap } from '@/components/maps/BusMap';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatSpeed } from '@/utils/format';
import { estimateEtaMinutes, formatEta, getDistanceKm } from '@/utils/geo';
import type { PassengerStackParamList } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';

export default function LiveTrackingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PassengerStackParamList>>();
  const { busDetails, selectedBusId, setSelectedBusId, isLoading, error, fetchAll } =
    useBusStore();
  const { location } = useUserLocation();

  const activeBus = useMemo(() => {
    if (selectedBusId) {
      return busDetails.find((b) => b.id === selectedBusId) ?? busDetails[0];
    }
    return busDetails.find((b) => b.status === 'active') ?? busDetails[0];
  }, [busDetails, selectedBusId]);

  useRealtimeBus(activeBus?.id);

  useEffect(() => {
    if (!selectedBusId && activeBus) {
      setSelectedBusId(activeBus.id);
    }
  }, [activeBus, selectedBusId, setSelectedBusId]);

  const eta = useMemo(() => {
    if (!activeBus?.gps || !location) return '—';
    const distance = getDistanceKm(
      location.latitude,
      location.longitude,
      activeBus.gps.latitude,
      activeBus.gps.longitude
    );
    return formatEta(estimateEtaMinutes(distance, activeBus.gps.speed));
  }, [activeBus, location]);

  if (error && !busDetails.length) {
    return <ErrorState message={error} onRetry={fetchAll} />;
  }

  const activeBuses = busDetails.filter((b) => b.status === 'active');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <Text style={styles.headerSubtitle}>Real-time telemetry and GPS position</Text>
        </View>

        {isLoading && !activeBus ? (
          <ListSkeleton count={2} />
        ) : activeBus ? (
          <>
            {/* Bus Select Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.busSelectorBar}
              contentContainerStyle={{ gap: 8 }}
            >
              {activeBuses.map((bus) => {
                const isActive = bus.id === activeBus.id;
                return (
                  <Pressable
                    key={bus.id}
                    onPress={() => setSelectedBusId(bus.id)}
                    style={[
                      styles.busPill,
                      isActive ? styles.busPillActive : styles.busPillInactive
                    ]}
                  >
                    <Ionicons 
                      name="bus-outline" 
                      size={15} 
                      color={isActive ? 'white' : '#F97316'} 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={isActive ? styles.busPillTextActive : styles.busPillTextInactive}>
                      {bus.bus_number}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* GPS Map View */}
            <View style={styles.mapWrapper}>
              <BusMap
                gps={activeBus.gps}
                userLatitude={location?.latitude}
                userLongitude={location?.longitude}
                height={280}
              />
            </View>

            {/* Active Bus telemetry metrics card */}
            <Card className="mt-4 border-[#FED7AA]">
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.busNumberTitle}>{activeBus.bus_number}</Text>
                  <Text style={styles.driverSubText}>Driver: {activeBus.driver_name ?? 'Assigned'}</Text>
                </View>
                <StatusBadge status={activeBus.status} />
              </View>

              <View style={styles.divider} />

              <Text style={styles.metaLabel}>ACTIVE ROUTE VECTORS</Text>
              <Text style={styles.routeValue}>{activeBus.route}</Text>

              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Ionicons name="speedometer-outline" size={18} color="#F97316" />
                  <Text style={styles.metricLabel}>Speed</Text>
                  <Text style={styles.metricVal}>
                    {activeBus.gps ? formatSpeed(activeBus.gps.speed) : '0 km/h'}
                  </Text>
                </View>

                <View style={[styles.metricCard, styles.bgCream]}>
                  <Ionicons name="time-outline" size={18} color="#166534" />
                  <Text style={styles.metricLabelGreen}>ETA Stop</Text>
                  <Text style={styles.metricValGreen}>{eta}</Text>
                </View>

                <View style={styles.metricCard}>
                  <Ionicons name="people-outline" size={18} color="#F97316" />
                  <Text style={styles.metricLabel}>Onboard</Text>
                  <Text style={styles.metricVal}>
                    {activeBus.seats?.occupied_seats ?? activeBus.passengers?.count ?? 0}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  navigation.navigate('BusInformation', { busId: activeBus.id })
                }
                style={({ pressed }) => [
                  styles.detailsButton,
                  pressed && styles.buttonPressed
                ]}
              >
                <Text style={styles.detailsButtonText}>Inspect Bus Telemetry</Text>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </Pressable>
            </Card>
          </>
        ) : (
          <Card className="border-[#FED7AA]">
            <Text style={styles.noBusesText}>No active buses available for tracking right now.</Text>
          </Card>
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
  busSelectorBar: {
    marginBottom: 16,
  },
  busPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    height: 38,
  },
  busPillActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  busPillInactive: {
    backgroundColor: 'white',
    borderColor: '#FED7AA',
  },
  busPillTextActive: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12.5,
  },
  busPillTextInactive: {
    color: '#F97316',
    fontWeight: '600',
    fontSize: 12.5,
  },
  mapWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busNumberTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  driverSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFF7ED',
    marginVertical: 14,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  routeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
    alignItems: 'center',
  },
  bgCream: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  metricLabelGreen: {
    fontSize: 9,
    fontWeight: '600',
    color: '#166534',
    marginTop: 4,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F97316',
    marginTop: 2,
  },
  metricValGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    marginTop: 2,
  },
  detailsButton: {
    flexDirection: 'row',
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  noBusesText: {
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
