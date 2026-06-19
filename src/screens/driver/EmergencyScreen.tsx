import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, Vibration, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAuthStore } from '@/store/authStore';
import { useBusStore } from '@/store/busStore';
import { emergencyService } from '@/services/emergencyService';
import { scheduleLocalNotification } from '@/services/pushNotificationService';
import { Card } from '@/components/ui/Card';
import { formatDateTime, getEmergencyStatusLabel } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function EmergencyScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { busDetails, fetchAll } = useBusStore();
  const [isTriggering, setIsTriggering] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeAlert, setActiveAlert] = useState<Awaited<
    ReturnType<typeof emergencyService.getActiveForBus>
  > | null>(null);

  const assignedBus = useMemo(() => {
    if (profile?.assigned_bus_id) {
      return busDetails.find((b) => b.id === profile.assigned_bus_id);
    }
    return busDetails.find((b) => b.driver_name === profile?.name) ?? busDetails[0];
  }, [busDetails, profile]);

  useEffect(() => {
    async function loadLocationAndAlert() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      } catch (e) {
        console.warn('Location permissions failed', e);
      }

      if (assignedBus?.id) {
        const alert = await emergencyService.getActiveForBus(assignedBus.id);
        setActiveAlert(alert);
      }
    }
    loadLocationAndAlert();
  }, [assignedBus?.id]);

  const triggerEmergency = () => {
    if (!assignedBus) {
      Alert.alert('Error', 'No bus assigned to your account');
      return;
    }

    Alert.alert(
      'Trigger Emergency SOS',
      'This will broadcast warning alerts to administrators, passengers, and terminal display widgets immediately. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trigger Alert',
          style: 'destructive',
          onPress: async () => {
            setIsTriggering(true);
            try {
              Vibration.vibrate([0, 500, 200, 500]);

              let lat = location?.latitude ?? 8.4542;
              let lng = location?.longitude ?? 124.6319;

              try {
                const pos = await Location.getCurrentPositionAsync({});
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                setLocation({ latitude: lat, longitude: lng });
              } catch (e) {
                // use default coordinates
              }

              const alert = await emergencyService.createAlert({
                bus_id: assignedBus.id,
                latitude: lat,
                longitude: lng,
              });

              setActiveAlert(alert);
              await scheduleLocalNotification(
                'Emergency Alert Active',
                `SOS alarm for ${assignedBus.bus_number} has been dispatched.`
              );
              await fetchAll();
            } catch (err) {
              Alert.alert(
                'Failed',
                err instanceof Error ? err.message : 'Could not send emergency alert'
              );
            } finally {
              setIsTriggering(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency Panel</Text>
          <Text style={styles.headerSubtitle}>Instant dispatcher communication & SOS</Text>
        </View>

        {/* SOS Action Button Area */}
        <View style={styles.panicContainer}>
          <Pressable 
            onPress={triggerEmergency} 
            disabled={isTriggering}
            style={({ pressed }) => [
              styles.panicPulseOuter,
              pressed && { opacity: 0.9 }
            ]}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.panicButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="warning" size={48} color="white" />
              <Text style={styles.panicButtonText}>SOS ALERT</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.panicHint}>
            Holding or tapping sends location telemetry to administrators.
          </Text>
        </View>

        {/* Emergency Alert Info */}
        <Card title="Broadcast Status" className="border-[#FED7AA] mb-4">
          {activeAlert ? (
            <View style={styles.activeContainer}>
              <View style={styles.activeHeader}>
                <View style={styles.dangerDot} />
                <Text style={styles.activeStatusText}>
                  {getEmergencyStatusLabel(activeAlert.status)}
                </Text>
              </View>
              
              <InfoRow label="DISPATCHED TIME" value={formatDateTime(activeAlert.timestamp)} />
              <InfoRow label="REPORTING VEHICLE" value={assignedBus?.bus_number ?? '—'} />
              <InfoRow
                label="INCIDENT GPS COORDINATES"
                value={
                  activeAlert.latitude && activeAlert.longitude
                    ? `${activeAlert.latitude.toFixed(5)}, ${activeAlert.longitude.toFixed(5)}`
                    : 'Awaiting Lock...'
                }
              />
            </View>
          ) : (
            <View style={styles.clearAlertContainer}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#166534" />
              <Text style={styles.clearAlertText}>System Normal. No active emergencies reported.</Text>
            </View>
          )}
        </Card>

        {/* Local Telemetry */}
        {location ? (
          <Card className="border-[#FED7AA]" title="Local GPS Telemetry">
            <View style={styles.telemetryRow}>
              <Ionicons name="location-outline" size={18} color="#F97316" style={{ marginRight: 6 }} />
              <Text style={styles.telemetryText}>
                LAT: {location.latitude.toFixed(5)}  |  LNG: {location.longitude.toFixed(5)}
              </Text>
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
  panicContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  panicPulseOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  panicButton: {
    width: 146,
    height: 146,
    borderRadius: 73,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  panicButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: 1,
  },
  panicHint: {
    marginTop: 18,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  activeContainer: {
    marginTop: 4,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  activeStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFF7ED',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  clearAlertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  clearAlertText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  telemetryText: {
    fontSize: 13,
    fontWeight: '750',
    color: '#1F2937',
  },
});
