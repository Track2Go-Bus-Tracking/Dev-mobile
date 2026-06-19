import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'bus-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Ionicons name={icon} size={32} color="#64748B" />
      </View>
      <Text className="text-center text-lg font-semibold text-slate-900">{title}</Text>
      {message ? (
        <Text className="mt-2 text-center text-sm text-slate-500">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-6 w-full">
          <Button title={actionLabel} onPress={onAction} variant="outline" />
        </View>
      ) : null}
    </View>
  );
}
