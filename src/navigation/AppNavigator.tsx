import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { useRealtime } from '@/hooks/useRealtime';
import { isDriverRole } from '@/services/authService';
import { COLORS } from '@/utils/constants';
import type { RootStackParamList } from '@/types/navigation';

import AuthNavigator from './AuthNavigator';
import PassengerNavigator from './PassengerNavigator';
import DriverNavigator from './DriverNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtime();
  return <>{children}</>;
}

export default function AppNavigator() {
  const { profile, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isAuthenticated = Boolean(profile);
  const isDriver = profile ? isDriverRole(profile.role) : false;

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RealtimeProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isDriver ? (
              <Stack.Screen name="Driver" component={DriverNavigator} />
            ) : (
              <Stack.Screen name="Passenger" component={PassengerNavigator} />
            )}
          </Stack.Navigator>
        </RealtimeProvider>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
