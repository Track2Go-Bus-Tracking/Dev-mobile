import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { capitalize } from '@/utils/format';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { profile, signOut, isLoading } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Track2Go?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
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
              {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {capitalize(profile?.role ?? 'passenger')}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Digital Ticket & QR Code Section */}
          <Text style={styles.sectionTitle}>Digital Boarding Pass</Text>
          <View style={styles.ticketCard}>
            <LinearGradient
              colors={['#FFF7ED', '#FFFFFF']}
              style={styles.ticketTop}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.ticketHeaderRow}>
                <View style={styles.brandRow}>
                  <Ionicons name="bus" size={16} color="#F97316" />
                  <Text style={styles.ticketBrandText}>TRACK2GO TICKET</Text>
                </View>
                <View style={styles.ticketStatusBadge}>
                  <Text style={styles.ticketStatusText}>ACTIVE</Text>
                </View>
              </View>

              <Text style={styles.ticketRoute}>CDO Agora ⇄ Manolo Fortich</Text>
              
              <View style={styles.ticketDetailsGrid}>
                <View style={styles.ticketDetailCell}>
                  <Text style={styles.ticketDetailLabel}>PASSENGER</Text>
                  <Text style={styles.ticketDetailValue} numberOfLines={1}>{profile?.name?.split(' ')[0] ?? 'Demo'}</Text>
                </View>
                <View style={styles.ticketDetailCell}>
                  <Text style={styles.ticketDetailLabel}>FARE TYPE</Text>
                  <Text style={styles.ticketDetailValue}>Regular Single</Text>
                </View>
                <View style={styles.ticketDetailCell}>
                  <Text style={styles.ticketDetailLabel}>FARE RATE</Text>
                  <Text style={styles.ticketDetailValue}>₱85.00</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Ticket Stub Dotted Separator with side cutouts */}
            <View style={styles.ticketSeparatorContainer}>
              <View style={styles.ticketLeftCutout} />
              <View style={styles.ticketDashedLine} />
              <View style={styles.ticketRightCutout} />
            </View>

            {/* QR Code Bottom Section */}
            <View style={styles.ticketBottom}>
              <View style={styles.qrCodeWrapper}>
                {/* Simulated Stylized Pixel QR Code */}
                <View style={styles.simulatedQr}>
                  <View style={styles.qrCornerAnchor} />
                  <View style={[styles.qrCornerAnchor, { right: 10 }]} />
                  <View style={[styles.qrCornerAnchor, { bottom: 10 }]} />
                  {/* Decorative QR Pixel Blocks */}
                  <View style={styles.qrCenterPixels}>
                    <View style={styles.pixelRow}><View style={styles.pActive}/><View style={styles.pMuted}/><View style={styles.pActive}/><View style={styles.pActive}/></View>
                    <View style={styles.pixelRow}><View style={styles.pMuted}/><View style={styles.pActive}/><View style={styles.pMuted}/><View style={styles.pActive}/></View>
                    <View style={styles.pixelRow}><View style={styles.pActive}/><View style={styles.pMuted}/><View style={styles.pActive}/><View style={styles.pMuted}/></View>
                    <View style={styles.pixelRow}><View style={styles.pActive}/><View style={styles.pActive}/><View style={styles.pMuted}/><View style={styles.pActive}/></View>
                  </View>
                </View>
              </View>
              
              <Text style={styles.ticketIdText}>Ticket ID: T2G-9842106</Text>
              <Text style={styles.ticketInstruction}>
                Scan QR code at the bus entrance scanner when boarding.
              </Text>
            </View>
          </View>

          {/* Account Details Card */}
          <Text style={styles.sectionTitle}>Account Profiles</Text>
          <Card className="border-[#FED7AA] mb-4">
            <SettingsRow icon="person-outline" label="Full Name" value={profile?.name ?? '—'} />
            <SettingsRow icon="mail-outline" label="Email Address" value={profile?.email ?? '—'} />
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Assigned Access"
              value={capitalize(profile?.role ?? 'passenger')}
            />
          </Card>

          {/* Preferences Card */}
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card className="border-[#FED7AA] mb-6">
            <Pressable style={styles.settingsRowBtn}>
              <Ionicons name="notifications-outline" size={20} color="#F97316" />
              <Text style={styles.settingsRowBtnText}>Push Alerts & Delays</Text>
              <Ionicons name="chevron-forward" size={16} color="#FB923C" />
            </Pressable>
            
            <Pressable style={[styles.settingsRowBtn, styles.borderTop]}>
              <Ionicons name="location-outline" size={20} color="#F97316" />
              <Text style={styles.settingsRowBtnText}>Background Location Services</Text>
              <Ionicons name="chevron-forward" size={16} color="#FB923C" />
            </Pressable>
          </Card>

          {/* Logout Button */}
          <Button
            title="Sign Out Account"
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

function SettingsRow({
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
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: 'rgba(249,115,22,0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 20,
    overflow: 'hidden',
  },
  ticketTop: {
    padding: 20,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketBrandText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: 1,
  },
  ticketStatusBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  ticketStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
  ticketRoute: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 14,
  },
  ticketDetailsGrid: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  ticketDetailCell: {
    flex: 1,
  },
  ticketDetailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  ticketDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  ticketSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    backgroundColor: 'white',
  },
  ticketLeftCutout: {
    width: 14,
    height: 20,
    backgroundColor: '#FFF7ED', // Same as page background
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderRightWidth: 1,
    borderRightColor: '#FED7AA',
    position: 'absolute',
    left: -1,
  },
  ticketRightCutout: {
    width: 14,
    height: 20,
    backgroundColor: '#FFF7ED',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#FED7AA',
    position: 'absolute',
    right: -1,
  },
  ticketDashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginHorizontal: 16,
  },
  ticketBottom: {
    backgroundColor: '#FFF7ED', // Warm Cream Stub
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 10,
  },
  simulatedQr: {
    width: 90,
    height: 90,
    position: 'relative',
  },
  qrCornerAnchor: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 4,
    borderColor: '#1F2937',
    borderRadius: 4,
  },
  qrCenterPixels: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  pixelRow: {
    flexDirection: 'row',
    gap: 4,
  },
  pActive: {
    width: 6,
    height: 6,
    backgroundColor: '#1F2937',
  },
  pMuted: {
    width: 6,
    height: 6,
    backgroundColor: 'transparent',
  },
  ticketIdText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  ticketInstruction: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginHorizontal: 24,
    marginTop: 6,
    lineHeight: 14,
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
  settingsRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingsRowBtnText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#FFF7ED',
  },
  signOutButton: {
    borderColor: '#EF4444',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 16,
  },
});
