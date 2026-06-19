import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BusStatus } from '@/types';
import { getBusStatusLabel } from '@/utils/format';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BusStatus, { bg: string; text: string; dot: string }> = {
  active:      { bg: '#F0FDF4', text: '#166534', dot: '#166534' },
  inactive:    { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  maintenance: { bg: '#FEF3C7', text: '#D97706', dot: '#D97706' },
  emergency:   { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444' },
};

interface StatusBadgeProps {
  status: BusStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
      <Text style={[styles.statusText, { color: s.text }]}>
        {getBusStatusLabel(status)}
      </Text>
    </View>
  );
}

// ─── Quick Action Card ─────────────────────────────────────────────────────────

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress: () => void;
}

export function QuickActionCard({
  title,
  subtitle,
  icon,
  color = '#F97316',
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.82 }]}
    >
      <View style={[styles.quickIconWrapper, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────

interface StatItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // StatusBadge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // QuickActionCard
  quickCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 2,
  },
  quickIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  quickSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },

  // StatItem
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  statValueHighlight: {
    color: '#F97316',
  },
  statLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
});
