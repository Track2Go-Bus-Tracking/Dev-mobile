import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BusStatus } from '@/types';
import { getBusStatusLabel } from '@/utils/format';

const statusColors: Record<BusStatus, string> = {
  active: 'bg-success/15 text-success',
  inactive: 'bg-slate-100 text-slate-600',
  maintenance: 'bg-warning/15 text-warning',
  emergency: 'bg-danger/15 text-danger',
};

interface StatusBadgeProps {
  status: BusStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <View className={`self-start rounded-full px-3 py-1 ${statusColors[status]}`}>
      <Text className="text-xs font-semibold">{getBusStatusLabel(status)}</Text>
    </View>
  );
}

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
  color = '#2563EB',
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 min-w-[45%] rounded-2xl border border-slate-100 bg-white p-4 shadow-sm active:opacity-80"
    >
      <View
        className="mb-3 h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text className="text-base font-semibold text-slate-900">{title}</Text>
      <Text className="mt-1 text-xs text-slate-500">{subtitle}</Text>
    </Pressable>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <View className="flex-1 items-center rounded-xl bg-slate-50 px-2 py-3">
      <Text className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-slate-900'}`}>
        {value}
      </Text>
      <Text className="mt-1 text-center text-xs text-slate-500">{label}</Text>
    </View>
  );
}
