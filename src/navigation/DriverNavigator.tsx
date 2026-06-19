import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import type { DriverTabParamList } from '@/types/navigation';

import DashboardScreen from '@/screens/driver/DashboardScreen';
import PassengerCounterScreen from '@/screens/driver/PassengerCounterScreen';
import EmergencyScreen from '@/screens/driver/EmergencyScreen';
import TripHistoryScreen from '@/screens/driver/TripHistoryScreen';
import DriverProfileScreen from '@/screens/driver/ProfileScreen';

const Tab = createBottomTabNavigator<DriverTabParamList>();

export default function DriverNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          borderTopColor: COLORS.border,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof DriverTabParamList, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'speedometer',
            PassengerCounter: 'people',
            Emergency: 'warning',
            TripHistory: 'time',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen
        name="PassengerCounter"
        component={PassengerCounterScreen}
        options={{ title: 'Counter' }}
      />
      <Tab.Screen name="Emergency" component={EmergencyScreen} />
      <Tab.Screen name="TripHistory" component={TripHistoryScreen} options={{ title: 'Trips' }} />
      <Tab.Screen name="Profile" component={DriverProfileScreen} />
    </Tab.Navigator>
  );
}
