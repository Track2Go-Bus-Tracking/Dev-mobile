import { View } from 'react-native';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  className?: string;
}

export function Skeleton({ width = '100%', height = 16, className }: SkeletonProps) {
  return (
    <View
      className={`rounded-lg bg-slate-200 ${className ?? ''}`}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <View className="rounded-2xl border border-slate-100 bg-white p-4">
      <Skeleton height={20} width="60%" />
      <View className="mt-3 gap-2">
        <Skeleton height={14} />
        <Skeleton height={14} width="80%" />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}
