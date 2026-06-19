import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useBusStore } from '@/store/busStore';
import { useRealtimeBus } from '@/hooks/useRealtime';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/utils/format';
import { DEFAULT_TOTAL_SEATS } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PassengerCounterScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { busDetails, isLoading } = useBusStore();

  const assignedBus = useMemo(() => {
    if (profile?.assigned_bus_id) {
      return busDetails.find((b) => b.id === profile.assigned_bus_id);
    }
    return busDetails.find((b) => b.driver_name === profile?.name) ?? busDetails[0];
  }, [busDetails, profile]);

  useRealtimeBus(assignedBus?.id);

  const count = assignedBus?.passengers?.count ?? 0;
  const occupied = assignedBus?.seats?.occupied_seats ?? count;
  const available = assignedBus?.seats?.available_seats ?? DEFAULT_TOTAL_SEATS - occupied;
  const total = assignedBus?.seats?.total_seats ?? DEFAULT_TOTAL_SEATS;
  const lastUpdate =
    assignedBus?.passengers?.timestamp ?? assignedBus?.seats?.timestamp;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Passenger Counter</Text>
          <Text style={styles.headerSubtitle}>Raspberry Pi IoT telemetry stream</Text>
        </View>

        {isLoading && !assignedBus ? (
          <ListSkeleton count={2} />
        ) : (
          <>
            {/* Counter Dial Header */}
            <LinearGradient
              colors={['#F97316', '#FB923C']}
              style={styles.counterBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.dialOuter}>
                <View style={styles.dialInner}>
                  <Text style={styles.dialNumber}>{count}</Text>
                  <Text style={styles.dialLabel}>PASSENGERS</Text>
                </View>
              </View>
              <Text style={styles.counterStatusText}>Live occupancy counter active</Text>
            </LinearGradient>

            {/* Capacity Grid */}
            <View style={styles.gridRow}>
              <View style={styles.gridCard}>
                <Ionicons name="people" size={18} color="#F97316" />
                <Text style={styles.gridLabel}>Occupied</Text>
                <Text style={styles.gridValHighlight}>{occupied}</Text>
              </View>

              <View style={styles.gridCard}>
                <Ionicons name="checkmark-circle" size={18} color="#166534" />
                <Text style={styles.gridLabel}>Available</Text>
                <Text style={styles.gridValGreen}>{available}</Text>
              </View>

              <View style={styles.gridCard}>
                <Ionicons name="grid" size={18} color="#4B5563" />
                <Text style={styles.gridLabel}>Total Seats</Text>
                <Text style={styles.gridVal}>{total}</Text>
              </View>
            </View>

            {/* Bus Info Details */}
            <Card title="Trip Parameters" className="border-[#FED7AA]">
              <InfoRow label="Assigned Vehicle" value={assignedBus?.bus_number ?? '—'} icon="bus-outline" />
              <InfoRow label="Active Route" value={assignedBus?.route ?? '—'} icon="git-commit-outline" />
              <InfoRow label="License Plate" value={assignedBus?.plate_number ?? '—'} icon="barcode-outline" />
              <InfoRow
                label="Last IoT Broadcast"
                value={lastUpdate ? formatDateTime(lastUpdate) : 'Waiting for telemetry...'}
                icon="time-outline"
              />
            </Card>

            {/* Sync Status footer */}
            <View style={styles.syncFooter}>
              <View style={styles.syncIndicatorPulse} />
              <Text style={styles.syncFooterText}>Hardware sensors synchronized</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.labelCol}>
        {icon && <Ionicons name={icon} size={18} color="#FB923C" style={{ marginRight: 8 }} />}
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.valueText}>{value}</Text>
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
  counterBanner: {
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 32,
    marginBottom: 20,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  dialOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  dialInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  dialNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#F97316',
  },
  dialLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  counterStatusText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.95,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 1,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 6,
  },
  gridValHighlight: {
    fontSize: 16,
    fontWeight: '850',
    color: '#F97316',
    marginTop: 2,
  },
  gridValGreen: {
    fontSize: 16,
    fontWeight: '850',
    color: '#166534',
    marginTop: 2,
  },
  gridVal: {
    fontSize: 16,
    fontWeight: '850',
    color: '#1F2937',
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
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  syncFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  syncIndicatorPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#166534',
    marginRight: 8,
  },
  syncFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
});
