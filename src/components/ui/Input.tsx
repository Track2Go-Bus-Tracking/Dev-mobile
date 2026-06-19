import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps & { className?: string }) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        className={`rounded-xl border bg-white px-4 py-3.5 text-base text-slate-900 ${
          error ? 'border-danger' : 'border-slate-200'
        } ${className ?? ''}`}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {error ? <Text className="mt-1 text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
