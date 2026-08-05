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
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Color Palette matching Sign In Screen
const BG_WHITE = '#FFFFFF';
const COLOR_PRIMARY_BLUE = '#004D73'; // Brand blue color
const COLOR_ACCENT_BLUE = '#004D73'; // Button & Link blue
const COLOR_GRAY_BG = '#F3F4F6'; // Input background
const COLOR_BORDER = '#E5E7EB'; // Card border
const TEXT_DARK = '#1F2937';
const TEXT_MUTED = '#6B7280';

export default function SignUpScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const { t } = useLanguage();
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth();
  const insets = useSafeAreaInsets();

  // Validation
  const isEmailValid = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const isFormValid = 
    fullName.trim().length > 0 &&
    isEmailValid(email) &&
    password.length >= 6 &&
    password === confirmPassword &&
    agreeToTerms;

  const handleSignUp = async () => {
    if (!isFormValid) {
      if (!agreeToTerms) {
        Alert.alert('Error', 'Please agree to the Terms of Service and Privacy Policy');
      } else {
        Alert.alert('Error', 'Please fill in all fields correctly');
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/signup', {
        name: fullName,
        email: email,
        password: password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        await signIn(token, user);
        
        // Clear any existing lesson progress for a fresh user experience
        await AsyncStorage.multiRemove(['completed_lessons', 'user_stats', 'lesson_progress']);
        
        Alert.alert('Success', 'Account created successfully!');
        
        // Navigate to profile setup with the user's name
        router.push({
          pathname: '/profile-setup',
          params: { name: fullName }
        });
      } else {
        Alert.alert('Signup Failed', response.data.message || 'Something went wrong');
      }
    } catch (error: any) {
      console.error("Signup error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Server connection error. Please make sure your backend is running.';
      Alert.alert('Signup Error', errorMessage);
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
            <ThemedText style={styles.welcomeTitle}>Create Your Account</ThemedText>
            <ThemedText style={styles.welcomeSubtext}>
              Start your learning journey with WeTalk
            </ThemedText>
          </View>

          {/* Card Container */}
          <View style={styles.cardContainer}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="account-outline" size={20} color={COLOR_PRIMARY_BLUE} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

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
                onChangeText={setEmail}
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

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={COLOR_PRIMARY_BLUE} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye" : "eye-off"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions Checkbox */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                style={styles.checkboxContainer}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxSelected]}>
                  {agreeToTerms && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <ThemedText style={styles.checkboxText}>
                  I agree to the <ThemedText style={styles.inlineLink}>Terms of Service</ThemedText> and <ThemedText style={styles.inlineLink}>Privacy Policy</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Main Sign-Up Button */}
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={[styles.signUpButton, !isFormValid && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.signUpButtonText}>Sign Up</ThemedText>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <ThemedText style={styles.orText}>or</ThemedText>
              <View style={styles.line} />
            </View>

            {/* Stacked Social Logins */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => signInWithGoogle('signup')}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#EA4335" size="small" />
              ) : (
                <>
                  <AntDesign name="google" size={18} color="#EA4335" style={styles.socialIcon} />
                  <ThemedText style={styles.socialButtonText}>Sign up with Google</ThemedText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome5 name="facebook-f" size={16} color="#1877F2" style={styles.socialIcon} />
              <ThemedText style={styles.socialButtonText}>Sign up with Facebook</ThemedText>
            </TouchableOpacity>

            {/* Footer Text */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.push('/sign-in')}>
                <ThemedText style={styles.signInLink}>Sign In</ThemedText>
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
    width: 120,
    height: 120,
    marginTop: -5,
    marginBottom: -5,
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
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
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
  checkboxText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
    flexWrap: 'wrap',
    flex: 1,
  },
  inlineLink: {
    fontFamily: 'Nunito-Bold',
    color: COLOR_PRIMARY_BLUE,
    fontSize: 12,
  },
  signUpButton: {
    backgroundColor: COLOR_PRIMARY_BLUE,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signUpButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.7,
  },
  signUpButtonText: {
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
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG_WHITE,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    marginBottom: 12,
    gap: 8,
  },
  socialIcon: {
    marginRight: 2,
  },
  socialButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: TEXT_DARK,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  signInLink: {
    fontFamily: 'Nunito-Bold',
    color: COLOR_PRIMARY_BLUE,
    fontSize: 13,
  },
});
