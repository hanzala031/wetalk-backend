import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { apiClient } from '@/lib/api-client';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const COLOR_PRIMARY_BLUE = '#004D73';
const COLOR_DARK_NAVY = '#003352';
const COLOR_WHITE = '#FFFFFF';
const COLOR_RED = '#EF4444';
const COLOR_GRAY_BORDER = '#E2E8F0';
const COLOR_GRAY_LIGHT = '#F8FAFC';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#64748B';

// Custom SVG Illustration matching the WeTalk branding (Envelope + Lock + Flying Paper Plane)
const ResetEmailIllustration = () => (
  <View style={styles.illustrationWrapper}>
    <Svg width={180} height={130} viewBox="0 0 180 130" fill="none">
      <Circle cx="90" cy="75" r="45" fill="#EEF4FF" />
      <Path
        d="M50 70 C 50 45, 90 35, 125 25"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <Path d="M45 40 L47 44 L51 45 L47 46 L45 50 L43 46 L39 45 L43 44 Z" fill="#93C5FD" />
      <Path d="M125 55 L126.5 58 L129.5 59 L126.5 60 L125 63 L123.5 60 L120.5 59 L123.5 58 Z" fill="#93C5FD" />
      
      <Rect x="55" y="45" width="70" height="48" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
      
      <Path d="M55 52 L90 73 L125 52" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M55 90 L80 70" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M125 90 L100 70" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round" />

      <G transform="translate(77, 50)">
        <Path d="M7 10 V6 A5 5 0 0 1 17 6 V10" stroke={COLOR_PRIMARY_BLUE} strokeWidth="2.2" strokeLinecap="round" />
        <Rect x="3" y="10" width="18" height="15" rx="3" fill={COLOR_PRIMARY_BLUE} />
        <Circle cx="12" cy="16" r="1.5" fill="#FFFFFF" />
        <Path d="M12 17.5 V20" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      </G>

      <G transform="translate(115, 12) rotate(10)">
        <Path d="M0 12 L22 0 L14 20 L9 13 Z" fill="#3B82F6" />
        <Path d="M9 13 L22 0 L14 20 L9 13 Z" fill={COLOR_PRIMARY_BLUE} opacity="0.3" />
      </G>
    </Svg>
  </View>
);

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [step, setStep] = useState<'forgot' | 'inbox'>('forgot');
  const [debugResetToken, setDebugResetToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadEmail = async () => {
      try {
        let emailToSet = params.email || '';
        if (!emailToSet) {
          emailToSet = await SecureStore.getItemAsync('lastLoggedOutEmail') || '';
        }
        
        if (emailToSet) {
          const cleanEmail = emailToSet.trim();
          setEmail(cleanEmail);
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          setIsEmailValid(emailRegex.test(cleanEmail));
        }
      } catch (err) {
        console.log('Error reading stored email:', err);
      }
    };
    loadEmail();
  }, [params.email]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: any = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = (text: string) => {
    const clean = text.trim();
    if (!clean) {
      return 'Email is required.';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleEmailChange = (text: string) => {
    // Automatically trim spaces
    const trimmed = text.replace(/\s+/g, '');
    setEmail(trimmed);

    // Live validation
    const error = validateEmail(trimmed);
    setEmailError(error);
    setIsEmailValid(error === null);
  };

  const handleSendResetLink = async () => {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      setIsEmailValid(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email: email.trim() });
      if (response.data?.success) {
        // Navigate to VerifyOTP screen and pass pre-filled email
        router.push({
          pathname: '/verify-otp',
          params: { email: email.trim() }
        });
      } else {
        setEmailError(response.data?.message || 'Failed to send reset link.');
        setIsEmailValid(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'No account found with this email.';
      setEmailError(msg);
      setIsEmailValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendResetLink = async () => {
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email: email.trim() });
      if (response.data?.success) {
        setCooldown(60);
        if (response.data?.token) {
          setDebugResetToken(response.data.token);
        }
      } else {
        setEmailError(response.data?.message || 'Failed to resend reset link.');
        setIsEmailValid(false);
        setStep('forgot');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'No account found with this email.';
      setEmailError(msg);
      setIsEmailValid(false);
      setStep('forgot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        email: email.trim(),
        otp: cleanOtp
      });
      
      if (response.data?.success) {
        // Navigate to reset-password with this verified OTP
        router.push({
          pathname: '/reset-password',
          params: { token: cleanOtp }
        });
      } else {
        setOtpError(response.data?.message || 'Invalid OTP code.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification failed. Please try again.';
      setOtpError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Back Button Top-Left */}
      <TouchableOpacity
        onPress={() => {
          if (step === 'inbox') {
            setStep('forgot');
          } else {
            router.back();
          }
        }}
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
        <Ionicons name="arrow-back" size={24} color={COLOR_PRIMARY_BLUE} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 45 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* WeTalk Logo */}
          <View style={styles.brandContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>

          {step === 'forgot' ? (
            // Forgot Password Screen State
            <View style={{ width: '100%', alignItems: 'center' }}>
              {/* Title & Description */}
              <View style={styles.headerTextSection}>
                <Text style={styles.titleText}>Forgot Password?</Text>
                <Text style={styles.descriptionText}>
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </Text>
              </View>

              {/* Main White Card */}
              <View style={styles.cardContainer}>
                {/* Field Label */}
                <Text style={styles.inputLabel}>Email Address</Text>

                {/* Email Input Field */}
                <View
                  style={[
                    styles.inputWrapper,
                    emailError ? styles.inputWrapperError : null,
                  ]}
                >
                  <View style={styles.iconBox}>
                    <Ionicons name="mail-outline" size={20} color={COLOR_PRIMARY_BLUE} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email address"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={handleEmailChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                    autoCorrect={false}
                  />
                </View>

                {/* Error Banner / Live Error message */}
                {emailError && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={COLOR_RED} style={{ marginRight: 6 }} />
                    <Text style={styles.errorText}>{emailError}</Text>
                  </View>
                )}

                {/* Send Reset Link Primary Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[
                    styles.primaryButton,
                    (!isEmailValid || isLoading) && styles.disabledButton,
                  ]}
                  onPress={handleSendResetLink}
                  disabled={!isEmailValid || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLOR_WHITE} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>or</Text>
                  <View style={styles.line} />
                </View>

                {/* Secondary Back to Sign In Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.outlineButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={18} color={COLOR_PRIMARY_BLUE} style={{ marginRight: 8 }} />
                  <Text style={styles.outlineButtonText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Check Your Inbox Screen State
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.headerTextSection}>
                <Text style={styles.titleText}>Check your inbox</Text>
                <Text style={styles.descriptionText}>
                  We've sent a 6-digit password reset OTP code to your email address.
                </Text>
              </View>

              <View style={styles.cardContainer}>
                {/* Vector Illustration */}
                <ResetEmailIllustration />

                <Text style={styles.inboxSubtext}>
                  We've sent a secure password reset OTP code to:
                </Text>
                <Text style={styles.inboxEmailText}>{email}</Text>

                {/* OTP Input Field */}
                <Text style={[styles.inputLabel, { marginTop: 24 }]}>Enter 6-Digit OTP</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    otpError ? styles.inputWrapperError : null,
                    { marginBottom: 10 }
                  ]}
                >
                  <View style={styles.iconBox}>
                    <Ionicons name="key-outline" size={20} color={COLOR_PRIMARY_BLUE} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter 6-digit OTP code"
                    placeholderTextColor="#94A3B8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isVerifying}
                    autoCorrect={false}
                  />
                </View>

                {otpError && (
                  <View style={[styles.errorBox, { marginBottom: 15 }]}>
                    <Ionicons name="alert-circle" size={16} color={COLOR_RED} style={{ marginRight: 6 }} />
                    <Text style={styles.errorText}>{otpError}</Text>
                  </View>
                )}

                {/* Verify OTP Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[
                    styles.primaryButton,
                    (otp.trim().length !== 6 || isVerifying) && styles.disabledButton,
                    { marginBottom: 16 }
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={otp.trim().length !== 6 || isVerifying}
                >
                  {isVerifying ? (
                    <ActivityIndicator color={COLOR_WHITE} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>

                {/* Resend Link Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[
                    styles.outlineButton,
                    (cooldown > 0 || isLoading) && styles.disabledButton,
                    { marginBottom: 16 }
                  ]}
                  onPress={handleResendResetLink}
                  disabled={cooldown > 0 || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLOR_PRIMARY_BLUE} />
                  ) : (
                    <Text style={styles.outlineButtonText}>
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP Code'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>or</Text>
                  <View style={styles.line} />
                </View>

                {/* Back to Sign In */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.outlineButton}
                  onPress={() => router.replace('/sign-in')}
                >
                  <Ionicons name="arrow-back" size={18} color={COLOR_PRIMARY_BLUE} style={{ marginRight: 8 }} />
                  <Text style={styles.outlineButtonText}>Back to Sign In</Text>
                </TouchableOpacity>

                {debugResetToken && (
                  <View style={styles.debugCard}>
                    <Text style={styles.debugTitle}>🛠️ Debug Option (SMTP Not Configured)</Text>
                    <Text style={styles.debugText}>
                      We generated a reset OTP code: {debugResetToken}. Enter this code in the input field above, or click below to open the Reset Password screen directly:
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.debugButton}
                      onPress={() => {
                        router.push({
                          pathname: '/reset-password',
                          params: { token: debugResetToken }
                        });
                      }}
                    >
                      <Text style={styles.debugButtonText}>Go to Reset Password Screen</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 6,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  logoImage: {
    width: 250,
    height: 95,
  },
  headerTextSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  titleText: {
    fontSize: 26,
    fontFamily: 'Nunito-Bold',
    color: COLOR_PRIMARY_BLUE,
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: COLOR_WHITE,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#004D73',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: COLOR_PRIMARY_BLUE,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR_GRAY_LIGHT,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLOR_GRAY_BORDER,
    paddingHorizontal: 12,
    height: 56,
  },
  inputWrapperError: {
    borderColor: COLOR_RED,
    backgroundColor: '#FFF5F5',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: TEXT_DARK,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLOR_RED,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  inboxSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 10,
  },
  inboxEmailText: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: COLOR_PRIMARY_BLUE,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: COLOR_PRIMARY_BLUE,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLOR_PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: COLOR_WHITE,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginHorizontal: 14,
  },
  outlineButton: {
    backgroundColor: COLOR_WHITE,
    borderWidth: 1.5,
    borderColor: COLOR_PRIMARY_BLUE,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: COLOR_PRIMARY_BLUE,
  },
  debugCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  debugTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#92400E',
    marginBottom: 6,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 12,
  },
  debugButton: {
    backgroundColor: '#D97706',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
  },
});
