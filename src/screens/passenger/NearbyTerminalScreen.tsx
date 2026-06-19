import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { terminalService } from '@/services/terminalService';
import { useBusStore } from '@/store/busStore';
import { useUserLocation } from '@/hooks/useLocation';
import { BusMap } from '@/components/maps/BusMap';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getDistanceKm, formatDistance } from '@/utils/geo';
import type { Terminal } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface TerminalWithDistance extends Terminal {
  distanceKm: number;
  activeBuses: number;
}

export default function NearbyTerminalScreen() {
  const [terminals, setTerminals] = useState<TerminalWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { buses } = useBusStore();
  const { location } = useUserLocation();

  useEffect(() => {
    loadTerminals();
  }, [buses, location]);

  async function loadTerminals() {
    setIsLoading(true);
    try {
      const data = await terminalService.getAll();
      const activeCount = buses.filter((b) => b.status === 'active').length;

      const withDistance: TerminalWithDistance[] = data.map((t) => ({
        ...t,
        distanceKm:
          location && t.latitude && t.longitude
            ? getDistanceKm(location.latitude, location.longitude, t.latitude, t.longitude)
            : 0,
        activeBuses: activeCount,
      }));

      withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
      setTerminals(withDistance);
    } finally {
      setIsLoading(false);
    }
  }

  const mapCenter = useMemo(() => {
    const nearest = terminals[0];
    if (nearest?.latitude && nearest?.longitude) {
      return { latitude: nearest.latitude, longitude: nearest.longitude };
    }
    return null;
  }, [terminals]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nearby Terminals</Text>
          <Text style={styles.headerSubtitle}>Transit points & operating hours</Text>
        </View>

        {mapCenter ? (
          <View style={styles.mapContainer}>
            <BusMap
              gps={{
                id: '',
                bus_id: '',
                latitude: mapCenter.latitude,
                longitude: mapCenter.longitude,
                speed: 0,
                timestamp: new Date().toISOString(),
              }}
              userLatitude={location?.latitude}
              userLongitude={location?.longitude}
              height={220}
            />
          </View>
        ) : null}

        {isLoading ? (
          <View style={{ marginTop: 12 }}>
            <ListSkeleton count={3} />
          </View>
        ) : terminals.length === 0 ? (
          <EmptyState
            icon="location-outline"
            title="No terminals found"
            message="Terminal details will appear when configured in the system."
          />
        ) : (
          terminals.map((terminal) => (
            <Card key={terminal.id} className="mt-4 border-[#FED7AA]">
              <View style={styles.terminalHeader}>
                <View style={styles.terminalNameContainer}>
                  <Ionicons name="location" size={18} color="#F97316" style={styles.locationIcon} />
                  <Text style={styles.terminalName}>{terminal.name}</Text>
                </View>
                {location && terminal.distanceKm > 0 ? (
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>
                      {formatDistance(terminal.distanceKm)}
                    </Text>
                  </View>
                ) : null}
              </View>
              
              <Text style={styles.terminalAddress}>{terminal.location}</Text>
              
              <View style={styles.divider} />
              
              <View style={styles.terminalFooter}>
                <View>
                  <Text style={styles.footerLabel}>OPERATING HOURS</Text>
                  <Text style={styles.footerValue}>
                    {terminal.operating_hours ?? '5:00 AM – 10:00 PM'}
                  </Text>
                </View>
                <View style={{ alignItems: 'end' }}>
                  <Text style={styles.footerLabel}>BUS DEPARTURES</Text>
                  <Text style={styles.footerValueSuccess}>
                    {terminal.activeBuses} Active
                  </Text>
                </View>
              </View>
            </Card>
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
  mapContainer: {
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    overflow: 'hidden',
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  terminalNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  locationIcon: {
    marginRight: 6,
  },
  terminalName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  distanceBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F97316',
  },
  terminalAddress: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 4,
    paddingLeft: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFF7ED',
    marginVertical: 12,
  },
  terminalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 24,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 2,
  },
  footerValueSuccess: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    marginTop: 2,
  },
});
