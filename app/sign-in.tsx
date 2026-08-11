import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, AntDesign, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Redesigned Color Palette matching 2nd Image Mockup
const BG_WHITE = '#FFFFFF';
const COLOR_PRIMARY_BLUE = '#004D73'; // New brand blue color requested by user
const COLOR_ACCENT_BLUE = '#004D73'; // Button & Link blue matching new brand color
const COLOR_GRAY_BG = '#F3F4F6'; // Input background
const COLOR_ICON_BG = '#004D73'; // Input left icon box background matches primary blue
const COLOR_BORDER = '#E5E7EB'; // Card border
const TEXT_DARK = '#1F2937';
const TEXT_MUTED = '#6B7280';

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth();
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(email.trim().toLowerCase(), password);
      if (!data.success) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Server connection error. Please make sure your backend is running.';
      Alert.alert('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Absolute Back Button */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
        <Ionicons name="arrow-back" size={24} color={COLOR_PRIMARY_BLUE} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 50 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand Logo Image */}
          <View style={styles.brandContainer}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logoIconImage}
              contentFit="contain"
            />
          </View>

          {/* Subtext */}
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeTitle}>Welcome Back!</ThemedText>
            <ThemedText style={styles.welcomeSubtext}>
              Sign in to continue your learning journey
            </ThemedText>
          </View>

          {/* Card Container */}
          <View style={styles.cardContainer}>
            <ThemedText style={styles.cardHeaderTitle}>Sign In</ThemedText>

            {/* Email Address Input */}
            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="email-outline" size={20} color={COLOR_PRIMARY_BLUE} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('email_address')}
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  AsyncStorage.setItem('lastUserEmail', text.trim().toLowerCase());
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={COLOR_PRIMARY_BLUE} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.rememberMeContainer}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxSelected]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <ThemedText style={styles.rememberMeText}>Remember me</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => router.push({ pathname: '/forgot-password', params: { email } })}
              >
                <ThemedText style={styles.forgotPasswordText}>{t('forgot_password')}</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Main Sign-In Button */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.signInButtonText}>Sign In</ThemedText>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <ThemedText style={styles.orText}>or</ThemedText>
              <View style={styles.line} />
            </View>

            {/* Side-by-side Social Login Row */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => signInWithGoogle('signin')}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#EA4335" size="small" />
                ) : (
                  <>
                    <AntDesign name="google" size={18} color="#EA4335" style={styles.socialIcon} />
                    <ThemedText style={styles.socialButtonText}>Google</ThemedText>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome5 name="facebook-f" size={16} color="#1877F2" style={styles.socialIcon} />
                <ThemedText style={styles.socialButtonText}>Facebook</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Footer Text */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>{t('new_to_wetalk')} </ThemedText>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <ThemedText style={styles.signUpLink}>{t('sign_up')}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_WHITE,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIconImage: {
    width: 90,
    height: 90,
    marginTop: -5,
    marginBottom: -5,
  },
  brandTitle: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 28,
    color: COLOR_PRIMARY_BLUE,
    lineHeight: 32,
  },
  brandSubtitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: COLOR_ACCENT_BLUE,
    letterSpacing: 0.5,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: COLOR_PRIMARY_BLUE,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: BG_WHITE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: COLOR_PRIMARY_BLUE,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR_GRAY_BG,
    borderRadius: 12,
    height: 52,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: TEXT_DARK,
    fontFamily: 'Inter-Regular',
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: COLOR_PRIMARY_BLUE,
    borderColor: COLOR_PRIMARY_BLUE,
  },
  rememberMeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  forgotPasswordButton: {
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontFamily: 'Nunito-Bold',
    color: COLOR_PRIMARY_BLUE,
    fontSize: 13,
  },
  signInButton: {
    backgroundColor: COLOR_PRIMARY_BLUE,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLOR_BORDER,
  },
  orText: {
    fontFamily: 'Inter-Regular',
    marginHorizontal: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG_WHITE,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    gap: 8,
  },
  socialIcon: {
    marginRight: 2,
  },
  socialButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: TEXT_DARK,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  signUpLink: {
    fontFamily: 'Nunito-Bold',
    color: COLOR_PRIMARY_BLUE,
    fontSize: 13,
  },
});
