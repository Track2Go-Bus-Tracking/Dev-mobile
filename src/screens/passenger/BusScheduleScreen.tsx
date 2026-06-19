import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scheduleService } from '@/services/scheduleService';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { BusSchedule } from '@/types';

export default function BusScheduleScreen() {
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [routes, setRoutes] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    setIsLoading(true);
    try {
      const [all, routeList] = await Promise.all([
        scheduleService.getAll(),
        scheduleService.getRoutes(),
      ]);
      setSchedules(all);
      setRoutes(routeList);
    } finally {
      setIsLoading(false);
    }
  }

  const filtered = schedules.filter((s) => {
    const matchesRoute = !selectedRoute || s.route_name === selectedRoute;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      s.route_name.toLowerCase().includes(query) ||
      s.terminal_name.toLowerCase().includes(query) ||
      (s.bus_number?.toLowerCase().includes(query) ?? false);
    return matchesRoute && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transit Schedules</Text>
          <Text style={styles.headerSubtitle}>Manolo Fortich & CDO Departures</Text>
        </View>

        {/* Search input */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schedules or stations..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Route Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          <Pressable
            onPress={() => setSelectedRoute('')}
            style={[
              styles.filterPill,
              !selectedRoute ? styles.filterPillActive : styles.filterPillInactive
            ]}
          >
            <Text style={!selectedRoute ? styles.filterPillTextActive : styles.filterPillTextInactive}>
              All Routes
            </Text>
          </Pressable>
          {routes.map((route) => (
            <Pressable
              key={route}
              onPress={() => setSelectedRoute(route)}
              style={[
                styles.filterPill,
                selectedRoute === route ? styles.filterPillActive : styles.filterPillInactive
              ]}
            >
              <Text
                style={
                  selectedRoute === route ? styles.filterPillTextActive : styles.filterPillTextInactive
                }
              >
                {route}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Schedules list */}
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No schedules found"
            message="Try adjusting your route filters or search term."
          />
        ) : (
          filtered.map((schedule) => (
            <Card key={schedule.id} className="mb-4 border-[#FED7AA]">
              <View style={styles.scheduleHeader}>
                <View style={styles.routeNameWrapper}>
                  <Ionicons name="git-commit-outline" size={16} color="#F97316" />
                  <Text style={styles.routeName}>{schedule.route_name}</Text>
                </View>
                <View style={styles.busBadge}>
                  <Text style={styles.busBadgeText}>
                    {schedule.bus_number || 'T2G Bus'}
                  </Text>
                </View>
              </View>

              <Text style={styles.terminalName}>{schedule.terminal_name}</Text>

              <View style={styles.timeGrid}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>DEPARTS</Text>
                  <Text style={styles.timeValue}>{schedule.departure_time}</Text>
                </View>

                <View style={styles.arrowBlock}>
                  <Ionicons name="arrow-forward-outline" size={18} color="#FB923C" />
                </View>

                <View style={styles.timeBlockRight}>
                  <Text style={styles.timeLabelRight}>ARRIVES (EST)</Text>
                  <Text style={styles.timeValueRight}>{schedule.arrival_time}</Text>
                </View>
              </View>

              <View style={styles.daysContainer}>
                <Text style={styles.daysLabel}>OPERATING DAYS: </Text>
                <Text style={styles.daysValue}>
                  {schedule.days?.join(', ') || 'Daily'}
                </Text>
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#1F2937',
  },
  filterBar: {
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterPillInactive: {
    backgroundColor: 'white',
    borderColor: '#FED7AA',
  },
  filterPillTextActive: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12.5,
  },
  filterPillTextInactive: {
    color: '#F97316',
    fontWeight: '600',
    fontSize: 12.5,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  busBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  busBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F97316',
  },
  terminalName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    paddingLeft: 22,
  },
  timeGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
  },
  timeBlock: {
    flex: 1.5,
  },
  timeBlockRight: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  arrowBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F97316',
    letterSpacing: 0.5,
  },
  timeLabelRight: {
    fontSize: 9,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
    marginTop: 2,
  },
  timeValueRight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 2,
  },
  daysContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingLeft: 4,
  },
  daysLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  daysValue: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#4B5563',
  },
});
