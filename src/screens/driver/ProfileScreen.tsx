import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useBusStore } from '@/store/busStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { capitalize } from '@/utils/format';
import { LinearGradient } from 'expo-linear-gradient';

export default function DriverProfileScreen() {
  const { profile, signOut, isLoading } = useAuthStore();
  const { busDetails } = useBusStore();

  const assignedBus = profile?.assigned_bus_id
    ? busDetails.find((b) => b.id === profile.assigned_bus_id)
    : busDetails.find((b) => b.driver_name === profile?.name);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card Header */}
        <LinearGradient
          colors={['#F97316', '#FB923C']}
          style={styles.profileHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() ?? 'D'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {capitalize(profile?.role ?? 'driver')}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Driver Details Card */}
          <Text style={styles.sectionTitle}>Driver Profile Details</Text>
          <Card className="border-[#FED7AA] mb-4">
            <InfoRow icon="person-outline" label="Full Name" value={profile?.name ?? '—'} />
            <InfoRow icon="mail-outline" label="Email Address" value={profile?.email ?? '—'} />
            <InfoRow icon="shield-checkmark-outline" label="Assigned Access" value={capitalize(profile?.role ?? 'driver')} />
          </Card>

          {/* Vehicle Assignment Card */}
          <Text style={styles.sectionTitle}>Assigned Vehicle Parameters</Text>
          <Card className="border-[#FED7AA] mb-6">
            <InfoRow
              icon="bus-outline"
              label="Assigned Bus"
              value={assignedBus?.bus_number ?? 'Not assigned'}
            />
            <InfoRow
              icon="git-commit-outline"
              label="Assigned Route"
              value={assignedBus?.route ?? '—'}
            />
            <InfoRow
              icon="barcode-outline"
              label="Plate Number"
              value={assignedBus?.plate_number ?? '—'}
            />
          </Card>

          {/* Logout Button */}
          <Button
            title="Sign Out Driver Session"
            variant="outline"
            onPress={handleLogout}
            loading={isLoading}
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.settingsDataRow}>
      <Ionicons name={icon} size={20} color="#F97316" style={styles.settingsIcon} />
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED', // Warm Cream
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F97316',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
  },
  profileEmail: {
    fontSize: 13,
    color: 'white',
    opacity: 0.85,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F97316',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    marginTop: 14,
    paddingLeft: 2,
  },
  settingsDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFF7ED',
    paddingVertical: 12,
  },
  settingsIcon: {
    marginRight: 10,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  settingsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  signOutButton: {
    borderColor: '#EF4444',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 16,
  },
});
