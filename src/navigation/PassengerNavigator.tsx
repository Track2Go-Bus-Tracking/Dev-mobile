import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/utils/constants';
import type { PassengerStackParamList, PassengerTabParamList } from '@/types/navigation';

import HomeScreen from '@/screens/passenger/HomeScreen';
import LiveTrackingScreen from '@/screens/passenger/LiveTrackingScreen';
import BusScheduleScreen from '@/screens/passenger/BusScheduleScreen';
import NearbyTerminalScreen from '@/screens/passenger/NearbyTerminalScreen';
import NotificationsScreen from '@/screens/passenger/NotificationsScreen';
import ProfileScreen from '@/screens/passenger/ProfileScreen';
import BusInformationScreen from '@/screens/passenger/BusInformationScreen';

const Tab = createBottomTabNavigator<PassengerTabParamList>();
const Stack = createNativeStackNavigator<PassengerStackParamList>();

function PassengerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F97316', // Orange Accent
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
          const icons: Record<keyof PassengerTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? 'home' : 'home-outline',
            Schedule: focused ? 'calendar' : 'calendar-outline',
            LiveTracking: focused ? 'navigate' : 'navigate-outline',
            Terminals: focused ? 'location' : 'location-outline',
            Notifications: focused ? 'notifications' : 'notifications-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schedule" component={BusScheduleScreen} />
      
      {/* Raised Floating Center Action Button for Live Tracking */}
      <Tab.Screen 
        name="LiveTracking" 
        component={LiveTrackingScreen} 
        options={{ 
          title: 'Track',
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={({ pressed }) => [
                styles.floatingButtonContainer,
                pressed && { opacity: 0.85 }
              ]}
            >
              <LinearGradient
                colors={['#F97316', '#FB923C']}
                style={styles.floatingButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="navigate" size={24} color="white" />
              </LinearGradient>
            </Pressable>
          )
        }} 
      />
      
      <Tab.Screen name="Terminals" component={NearbyTerminalScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function PassengerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={PassengerTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="BusInformation"
        component={BusInformationScreen}
        options={{ 
          title: 'Bus Telemetry Info', 
          headerTintColor: '#F97316',
          headerStyle: { backgroundColor: '#FFF7ED' },
          headerTitleStyle: { fontWeight: '700' }
        }}
      />
    </Stack.Navigator>
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
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFF7ED',
  }
});
