import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          borderTopColor: '#FED7AA',
          borderTopWidth: 1,
          backgroundColor: 'white',
          paddingTop: 6,
          height: 64,
          shadowColor: 'rgba(0,0,0,0.04)',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 4,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 6 },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<keyof DriverTabParamList, keyof typeof Ionicons.glyphMap> = {
            Dashboard: focused ? 'speedometer' : 'speedometer-outline',
            PassengerCounter: focused ? 'people' : 'people-outline',
            Emergency: 'warning',
            TripHistory: focused ? 'time' : 'time-outline',
            Profile: focused ? 'person' : 'person-outline',
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

      {/* Raised Emergency SOS floating center button */}
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={({ pressed }) => [
                styles.floatingButtonContainer,
                pressed && { opacity: 0.85 },
              ]}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.floatingButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="warning" size={24} color="white" />
              </LinearGradient>
            </Pressable>
          ),
        }}
      />

      <Tab.Screen
        name="TripHistory"
        component={TripHistoryScreen}
        options={{ title: 'Trips' }}
      />
      <Tab.Screen name="Profile" component={DriverProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
    width: 66,
    height: 66,
    zIndex: 10,
  },
  floatingButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFF7ED',
  },
});
