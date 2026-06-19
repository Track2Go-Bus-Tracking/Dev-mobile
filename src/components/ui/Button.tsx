import { View, Text, Pressable, ActivityIndicator, type PressableProps } from 'react-native';
import { COLORS } from '@/utils/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-primary', text: 'text-white' },
  secondary: { container: 'bg-secondary', text: 'text-white' },
  outline: { container: 'bg-transparent border border-primary', text: 'text-primary' },
  danger: { container: 'bg-danger', text: 'text-white' },
  ghost: { container: 'bg-transparent', text: 'text-primary' },
};

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  icon,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`flex-row items-center justify-center rounded-xl px-5 py-3.5 ${styles.container} ${
        isDisabled ? 'opacity-50' : ''
      } ${className ?? ''}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#fff'} />
      ) : (
        <>
          {icon}
          <Text className={`text-base font-semibold ${styles.text} ${icon ? 'ml-2' : ''}`}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
