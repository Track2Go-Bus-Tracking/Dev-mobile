import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/utils/constants';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen({ navigation }: any) {
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();
    setLocalError(null);
    try {
      await signIn(data.email, data.password);
    } catch {
      setLocalError('Invalid email or password. Please try again.');
    }
  };

  const displayError = localError ?? error;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-primary">
              <Text className="text-3xl font-bold text-white">T2</Text>
            </View>
            <Text className="text-3xl font-bold text-slate-900">{APP_NAME}</Text>
            <Text className="mt-2 text-center text-slate-500">
              Real-time bus tracking for passengers and drivers
            </Text>
          </View>

          <View className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Text className="mb-6 text-xl font-bold text-slate-900">Sign In</Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            {displayError ? (
              <Text className="mb-4 text-sm text-danger">{displayError}</Text>
            ) : null}

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
            />

            <View className="mt-4 flex-row items-center justify-center">
              <Text className="text-slate-500">Don't have an account? </Text>
              <Pressable onPress={() => navigation.navigate('SignUp')}>
                <Text className="font-semibold text-primary">Sign Up</Text>
              </Pressable>
            </View>
          </View>

          <Text className="mt-6 text-center text-xs text-slate-400">
            Passenger · Driver · Conductor access
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
