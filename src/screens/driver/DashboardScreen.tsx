import { useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import { useBusStore } from '@/store/busStore';
import { Card } from '@/components/ui/Card';
import { QuickActionCard, StatItem, StatusBadge } from '@/components/ui/Badge';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { getOccupancyPercentage } from '@/utils/format';
import { DEFAULT_TOTAL_SEATS } from '@/utils/constants';
import type { DriverTabParamList } from '@/types/navigation';

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

  const activeEmergency = emergencies.find((e) => e.bus_id === assignedBus?.id);
  const passengers = assignedBus?.passengers?.count ?? assignedBus?.seats?.occupied_seats ?? 0;
  const available = assignedBus?.seats?.available_seats ?? DEFAULT_TOTAL_SEATS - passengers;
  const total = assignedBus?.seats?.total_seats ?? DEFAULT_TOTAL_SEATS;

  if (error && !busDetails.length) {
    return <ErrorState message={error} onRetry={fetchAll} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-8"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAll} />}
      >
        <View className="py-4">
          <Text className="text-2xl font-bold text-slate-900">Driver Dashboard</Text>
          <Text className="mt-1 text-slate-500">Welcome, {profile?.name}</Text>
        </View>

        {isLoading && !assignedBus ? (
          <ListSkeleton count={2} />
        ) : (
          <Card className="mb-4" title="Current Trip">
            {assignedBus ? (
              <>
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-primary">
                    {assignedBus.bus_number}
                  </Text>
                  <StatusBadge status={assignedBus.status} />
                </View>
                <Text className="mb-4 text-sm text-slate-600">{assignedBus.route}</Text>
                <View className="flex-row gap-2">
                  <StatItem label="Passengers" value={passengers} highlight />
                  <StatItem label="Available" value={available} />
                  <StatItem
                    label="Occupancy"
                    value={`${getOccupancyPercentage(passengers, total)}%`}
                  />
                </View>
              </>
            ) : (
              <Text className="text-slate-500">No bus assigned</Text>
            )}
          </Card>
        )}

        {activeEmergency ? (
          <Card className="mb-4 border-danger/30 bg-danger/5">
            <Text className="font-bold text-danger">Emergency Active</Text>
            <Text className="mt-1 text-sm text-slate-600">
              Alert triggered at {new Date(activeEmergency.timestamp).toLocaleTimeString()}
            </Text>
          </Card>
        ) : null}

        <Text className="mb-3 text-lg font-semibold text-slate-900">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3">
          <QuickActionCard
            title="Passenger Counter"
            subtitle="Live count"
            icon="people"
            onPress={() => navigation.navigate('PassengerCounter')}
          />
          <QuickActionCard
            title="Emergency"
            subtitle="Panic button"
            icon="warning"
            color="#EF4444"
            onPress={() => navigation.navigate('Emergency')}
          />
          <QuickActionCard
            title="Trip History"
            subtitle="Past trips"
            icon="time"
            color="#0EA5E9"
            onPress={() => navigation.navigate('TripHistory')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
