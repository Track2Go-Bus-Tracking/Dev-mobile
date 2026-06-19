import { View, Text, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, subtitle, className, children, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-white p-4 shadow-sm border border-slate-100 ${className ?? ''}`}
      {...props}
    >
      {title ? <Text className="text-lg font-bold text-slate-900">{title}</Text> : null}
      {subtitle ? <Text className="mt-1 text-sm text-slate-500">{subtitle}</Text> : null}
      {title || subtitle ? <View className="mt-3">{children}</View> : children}
    </View>
  );
}
