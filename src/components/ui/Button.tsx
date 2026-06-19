import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { COLORS } from '@/utils/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const VARIANT_BG: Record<ButtonVariant, string> = {
  primary:   '#F97316',
  secondary: '#FB923C',
  outline:   'transparent',
  danger:    '#EF4444',
  ghost:     'transparent',
};

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary:   '#FFFFFF',
  secondary: '#FFFFFF',
  outline:   '#F97316',
  danger:    '#FFFFFF',
  ghost:     '#F97316',
};

const VARIANT_BORDER: Record<ButtonVariant, string | undefined> = {
  primary:   undefined,
  secondary: undefined,
  outline:   '#F97316',
  danger:    undefined,
  ghost:     undefined,
};

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  icon,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const bg = VARIANT_BG[variant];
  const textColor = VARIANT_TEXT[variant];
  const borderColor = VARIANT_BORDER[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        borderColor ? { borderWidth: 1.5, borderColor } : null,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#fff'}
          size="small"
        />
      ) : (
        <>
          {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
          <Text style={[styles.label, { color: textColor }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,         // Soft rounded corners
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconWrapper: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
