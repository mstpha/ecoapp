import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ToastAndroid } from 'react-native';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setLoading(false);

  if (error) {
    Alert.alert('Login Failed', error.message);
    return;
  }

  // 🔥 Check if email verified
  if (!data.user?.email_confirmed_at) {
    await supabase.auth.signOut();

    if (Platform.OS === 'android') {
      ToastAndroid.show(
        'Check your email to verify your account',
        ToastAndroid.LONG
      );
    } else {
      Alert.alert(
        'Verification Required',
        'Check your email to verify your account'
      );
    }

    return;
  }

  // If verified → continue
  router.replace('/(tabs)');
};


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#8E8E93"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => {
                // Handle forgot password
                Alert.alert('Info', 'Password reset functionality to be implemented');
              }}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/(auth)/register')}
              disabled={loading}
            >
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text style={styles.registerTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  contentWrapper: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    marginBottom: 48,
    backgroundColor: 'transparent',
  },
  accentBar: {
    width: 60,
    height: 4,
    backgroundColor: '#FF6B35',
    marginBottom: 24,
    borderRadius: 2,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    fontWeight: '400',
  },
  formSection: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  forgotPasswordText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  footerSection: {
    backgroundColor: 'transparent',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  dividerText: {
    color: '#8E8E93',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  registerLink: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  registerText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '400',
  },
  registerTextBold: {
    color: '#FF6B35',
    fontWeight: '700',
  },
});