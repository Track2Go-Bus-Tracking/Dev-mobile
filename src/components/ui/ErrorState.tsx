import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <Text className="mt-4 text-center text-lg font-semibold text-slate-900">
        Something went wrong
      </Text>
      <Text className="mt-2 text-center text-sm text-slate-500">{message}</Text>
      {onRetry ? (
        <View className="mt-6 w-full">
          <Button title="Try Again" onPress={onRetry} variant="outline" />
        </View>
      ) : null}
    </View>
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  return (
    <View className="mb-4 flex-row items-center">
      {onBack ? (
        <Pressable onPress={onBack} className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
      ) : null}
      <View className="flex-1">
        <Text className="text-2xl font-bold text-slate-900">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-sm text-slate-500">{subtitle}</Text> : null}
      </View>
    </View>
  );
}
