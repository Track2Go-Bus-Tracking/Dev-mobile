import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';
import { APP_NAME, COLORS } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthScreen({ navigation }: any) {
  const { signIn, signInAsDemo, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async (url: string) => {
      if (url.includes('access_token') || url.includes('error')) {
        const { error } = await supabase.auth.getUser();
        if (error) {
          setError(error.message);
        }
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleOAuthCallback(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleOAuthCallback(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'track2go://auth/callback',
        },
      });

      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (
        message.includes('Unsupported provider') || 
        message.includes('not enabled') || 
        err?.toString().includes('validation_failed') ||
        err?.toString().includes('Unsupported provider')
      ) {
        // Automatically activate local Demo Mode selection when Google OAuth is not configured
        setError('Google Sign-in is not enabled on this Supabase project. Local Demo Mode has been unlocked below!');
        setShowDemoPrompt(true);
      } else {
        setError(message || 'Google sign-in failed. Try using Demo Mode below.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#F97316', '#FB923C']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="bus-outline" size={38} color="white" />
          </LinearGradient>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.subtitle}>Smart Transit & Real-time Tracking</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to access schedules and live tracking</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="passenger@track2go.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Sign In"
            onPress={handleAuth}
            loading={isLoading}
            style={styles.signInButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SECURE ACCESS</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable 
            onPress={handleGoogleSignIn} 
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>
        </View>

        <View style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <Ionicons name="sparkles-outline" size={18} color="#166534" />
            <Text style={styles.demoTitle}>Quick Demo Access</Text>
          </View>
          <Text style={styles.demoSubtitle}>
            Bypass authorization to inspect the features of the Manolo Fortich tracking platform.
          </Text>
          
          <View style={styles.demoButtonsContainer}>
            <Pressable
              onPress={() => signInAsDemo('passenger')}
              style={({ pressed }) => [
                styles.demoButton,
                styles.passengerDemoColor,
                pressed && styles.buttonPressed
              ]}
            >
              <Ionicons name="people-outline" size={18} color="#F97316" />
              <Text style={styles.demoButtonTextPassenger}>Passenger Demo</Text>
            </Pressable>

            <Pressable
              onPress={() => signInAsDemo('driver')}
              style={({ pressed }) => [
                styles.demoButton,
                styles.driverDemoColor,
                pressed && styles.buttonPressed
              ]}
            >
              <Ionicons name="speedometer-outline" size={18} color="#166534" />
              <Text style={styles.demoButtonTextDriver}>Driver Demo</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.switchLink}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFF7ED', // Warm Cream
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoGradient: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937', // Dark Slate
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280', // Text Muted
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 24, // Soft Rounded
    padding: 24,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FED7AA', // Soft Orange Border
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    paddingLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16, // Soft edge radius
    backgroundColor: '#FFF7ED', // Warm Cream tint
  },
  inputIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  signInButton: {
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FED7AA',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 16,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  demoCard: {
    marginTop: 20,
    backgroundColor: '#F0FDF4', // Very light green tint for accent highlight
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 2,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534', // Accent forest green
    marginLeft: 6,
  },
  demoSubtitle: {
    fontSize: 12,
    color: '#166534',
    opacity: 0.8,
    marginBottom: 14,
    lineHeight: 16,
  },
  demoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  demoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  passengerDemoColor: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  driverDemoColor: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  demoButtonTextPassenger: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F97316',
    marginLeft: 6,
  },
  demoButtonTextDriver: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 6,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    color: '#6B7280',
    fontSize: 14,
  },
  switchLink: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '700',
  },
});
