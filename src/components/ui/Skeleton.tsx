import { View, StyleSheet } from 'react-native';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
}

export function Skeleton({ width = '100%', height = 16 }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height },
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={20} width="60%" />
      <View style={styles.gap}>
        <Skeleton height={14} />
      </View>
      <View style={styles.gap}>
        <Skeleton height={14} width="80%" />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#FED7AA',  // Warm orange tint instead of grey
    borderRadius: 10,
    opacity: 0.5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 16,
  },
  gap: {
    marginTop: 10,
  },
  list: {
    gap: 12,
  },
});
