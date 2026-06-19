import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '@/screens/auth/AuthScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import type { AuthStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
