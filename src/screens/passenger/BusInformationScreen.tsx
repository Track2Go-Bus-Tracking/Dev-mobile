import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useBusStore } from '@/store/busStore';
import { useRealtimeBus } from '@/hooks/useRealtime';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getOccupancyPercentage } from '@/utils/format';
import { DEFAULT_TOTAL_SEATS } from '@/utils/constants';
import type { PassengerStackParamList } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';

export default function BusInformationScreen() {
  const route = useRoute<RouteProp<PassengerStackParamList, 'BusInformation'>>();
  const { busId } = route.params;
  const { busDetails, fetchBusDetails, isLoading, error } = useBusStore();

  useRealtimeBus(busId);

  useEffect(() => {
    fetchBusDetails(busId);
  }, [busId, fetchBusDetails]);

  const bus = busDetails.find((b) => b.id === busId);
  const passengers = bus?.passengers?.count ?? bus?.seats?.occupied_seats ?? 0;
  const available = bus?.seats?.available_seats ?? DEFAULT_TOTAL_SEATS - passengers;
  const total = bus?.seats?.total_seats ?? DEFAULT_TOTAL_SEATS;
  const occupancy = getOccupancyPercentage(passengers, total);

  if (error && !bus) {
    return <ErrorState message={error} onRetry={() => fetchBusDetails(busId)} />;
  }

  if (isLoading && !bus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 16 }}>
          <ListSkeleton count={3} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transit Details</Text>
          <Text style={styles.headerSubtitle}>Real-time telemetry and status</Text>
        </View>

        <Card title="Bus Information" className="border-[#FED7AA]">
          <InfoRow label="Bus Identifier" value={bus?.bus_number ?? '—'} highlight icon="bus-outline" />
          <InfoRow label="Active Route" value={bus?.route ?? '—'} icon="git-commit-outline" />
          <InfoRow label="Plate Registration" value={bus?.plate_number ?? '—'} icon="barcode-outline" />
          <InfoRow label="Assigned Operator" value={bus?.driver_name ?? '—'} icon="person-outline" />
          <View style={styles.badgeRow}>
            <Text style={styles.statusLabel}>OPERATIONAL STATUS</Text>
            {bus ? <StatusBadge status={bus.status} /> : null}
          </View>
        </Card>

        <Card className="mt-4 border-[#FED7AA]" title="Passenger Capacity & Seats">
          <InfoRow label="Active Onboard Passengers" value={String(passengers)} icon="people-outline" />
          <InfoRow label="Available Seat Units" value={String(available)} highlight icon="checkmark-done-circle-outline" />
          <InfoRow label="Total Rated Capacity" value={String(total)} icon="grid-outline" />
          <InfoRow label="Relative Occupancy Ratio" value={`${occupancy}%`} icon="analytics-outline" />
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${occupancy}%`, backgroundColor: occupancy > 85 ? '#EF4444' : '#F97316' }
                ]}
              />
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.labelCol}>
        {icon && <Ionicons name={icon} size={18} color="#FB923C" style={{ marginRight: 8 }} />}
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={[styles.valueText, highlight ? styles.valueHighlight : null]}>
        {value}
      </Text>
    </View>
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#FFF7ED',
    paddingVertical: 12,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  valueHighlight: {
    color: '#F97316',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: 16,
    paddingBottom: 4,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#FED7AA',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
});
