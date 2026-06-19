import './global.css';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from '@/navigation/AppNavigator';
import {
  registerForPushNotifications,
  setupAndroidChannel,
} from '@/services/pushNotificationService';

export default function App() {
  useEffect(() => {
    setupAndroidChannel();
    registerForPushNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
