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

const { width } = Dimensions.get('window');

const COLOR_PRIMARY_BLUE = '#004D73';
const COLOR_DARK_NAVY = '#003352';
const COLOR_WHITE = '#FFFFFF';
const COLOR_RED = '#EF4444';
const COLOR_GREEN = '#10B981';
const COLOR_YELLOW = '#F59E0B';
const COLOR_GRAY_BORDER = '#E2E8F0';
const COLOR_GRAY_LIGHT = '#F8FAFC';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#64748B';

// Custom SVG Illustration matching WeTalk branding (Lock + Checkmark for Success)
const SuccessIllustration = () => (
  <View style={styles.illustrationWrapper}>
    <Svg width={180} height={130} viewBox="0 0 180 130" fill="none">
      {/* Background Soft Glow Circle */}
      <Circle cx="90" cy="65" r="45" fill="#ECFDF5" />
      
      {/* Little Decorative Sparkle Stars */}
      <Path d="M45 35 L47 39 L51 40 L47 41 L45 45 L43 41 L39 40 L43 39 Z" fill="#A7F3D0" />
      <Path d="M135 55 L136.5 58 L139.5 59 L136.5 60 L135 63 L133.5 60 L130.5 59 L133.5 58 Z" fill="#A7F3D0" />

      {/* Main Lock Icon */}
      <G transform="translate(70, 30)">
        {/* Lock Shackle (Opened) */}
        <Path d="M10 20 V12 A10 10 0 0 1 30 12 V18" stroke={COLOR_GREEN} strokeWidth="3" strokeLinecap="round" />
        {/* Lock Body */}
        <Rect x="4" y="20" width="32" height="26" rx="6" fill={COLOR_GREEN} />
        {/* Keyhole */}
        <Circle cx="20" cy="30" r="3" fill="#FFFFFF" />
        <Path d="M20 33 V38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </G>

      {/* Big Green Check Circle in front */}
      <Circle cx="115" cy="85" r="18" fill={COLOR_GREEN} />
      <Path d="M109 85 L113 89 L122 80" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [step, setStep] = useState<'reset' | 'success'>('reset');
  const insets = useSafeAreaInsets();

  // Rules Validation states
  const rules = {
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const allRulesPass = Object.values(rules).every((val) => val === true);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  
  // Calculate password strength
  const rulesSatisfied = Object.values(rules).filter(Boolean).length;
  let strengthLabel = 'Weak';
  let strengthColor = COLOR_RED;
  let strengthProgress = 0.33;

  if (rulesSatisfied >= 5) {
    strengthLabel = 'Strong';
    strengthColor = COLOR_GREEN;
    strengthProgress = 1.0;
  } else if (rulesSatisfied >= 3) {
    strengthLabel = 'Medium';
    strengthColor = COLOR_YELLOW;
    strengthProgress = 0.66;
  }

  const handleResetPassword = async () => {
    if (!token) {
      setApiError('Reset token is missing. Please request a new link.');
      return;
    }
    if (!allRulesPass) {
      setApiError('Please meet all password requirements.');
      return;
    }
    if (!passwordsMatch) {
      setApiError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.data?.success) {
        setStep('success');
      } else {
        setApiError(response.data?.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Reset link has expired or is invalid.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Back Button Top-Left */}
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

          {step === 'reset' ? (
            // Reset Password Form Screen
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.headerTextSection}>
                <Text style={styles.titleText}>Reset Password</Text>
                <Text style={styles.descriptionText}>
                  Please choose a strong and secure new password for your account.
                </Text>
              </View>

              {!token && (
                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={18} color={COLOR_YELLOW} style={{ marginRight: 8 }} />
                  <Text style={styles.warningText}>
                    Missing reset token. Please open the link directly from your email.
                  </Text>
                </View>
              )}

              {apiError && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={COLOR_RED} style={{ marginRight: 8 }} />
                  <Text style={styles.errorText}>{apiError}</Text>
                </View>
              )}

              <View style={styles.cardContainer}>
                {/* New Password Input */}
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconBox}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLOR_PRIMARY_BLUE} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter new password"
                    placeholderTextColor="#94A3B8"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Strength Bar */}
                {newPassword.length > 0 && (
                  <View style={styles.strengthSection}>
                    <View style={styles.strengthHeader}>
                      <Text style={styles.strengthLabel}>Password Strength: </Text>
                      <Text style={[styles.strengthValue, { color: strengthColor }]}>
                        {strengthLabel}
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${strengthProgress * 100}%`,
                            backgroundColor: strengthColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* Password Rules Checklist */}
                <View style={styles.checklistContainer}>
                  <View style={styles.checkRow}>
                    <Ionicons
                      name={rules.minLength ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={rules.minLength ? COLOR_GREEN : '#94A3B8'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.checkText, rules.minLength && styles.checkTextActive]}>
                      Minimum 8 characters
                    </Text>
                  </View>

                  <View style={styles.checkRow}>
                    <Ionicons
                      name={rules.hasUpper ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={rules.hasUpper ? COLOR_GREEN : '#94A3B8'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.checkText, rules.hasUpper && styles.checkTextActive]}>
                      One uppercase letter
                    </Text>
                  </View>

                  <View style={styles.checkRow}>
                    <Ionicons
                      name={rules.hasLower ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={rules.hasLower ? COLOR_GREEN : '#94A3B8'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.checkText, rules.hasLower && styles.checkTextActive]}>
                      One lowercase letter
                    </Text>
                  </View>

                  <View style={styles.checkRow}>
                    <Ionicons
                      name={rules.hasNumber ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={rules.hasNumber ? COLOR_GREEN : '#94A3B8'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.checkText, rules.hasNumber && styles.checkTextActive]}>
                      One number
                    </Text>
                  </View>

                  <View style={styles.checkRow}>
                    <Ionicons
                      name={rules.hasSpecial ? 'checkmark-circle' : 'close-circle'}
                      size={18}
                      color={rules.hasSpecial ? COLOR_GREEN : '#94A3B8'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.checkText, rules.hasSpecial && styles.checkTextActive]}>
                      One special character
                    </Text>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    confirmPassword.length > 0 && !passwordsMatch ? styles.inputWrapperError : null,
                  ]}
                >
                  <View style={styles.iconBox}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLOR_PRIMARY_BLUE} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password mismatch message */}
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <View style={styles.matchErrorContainer}>
                    <Ionicons name="alert-circle" size={16} color={COLOR_RED} style={{ marginRight: 6 }} />
                    <Text style={styles.matchErrorText}>Passwords do not match.</Text>
                  </View>
                )}

                {/* Reset Password Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[
                    styles.primaryButton,
                    (!allRulesPass || !passwordsMatch || isLoading) && styles.disabledButton,
                  ]}
                  onPress={handleResetPassword}
                  disabled={!allRulesPass || !passwordsMatch || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLOR_WHITE} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Success Screen State
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.headerTextSection}>
                <Text style={styles.titleText}>Password Reset Successfully</Text>
                <Text style={styles.descriptionText}>
                  Your password has been updated successfully.
                </Text>
              </View>

              <View style={styles.cardContainer}>
                {/* Illustration */}
                <SuccessIllustration />

                <Text style={styles.successDescription}>
                  You can now sign in to your WeTalk account with your new password and continue learning.
                </Text>

                {/* Go to Sign In button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.primaryButton}
                  onPress={() => router.replace('/sign-in')}
                >
                  <Text style={styles.primaryButtonText}>Go to Sign In</Text>
                </TouchableOpacity>
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
  eyeBtn: {
    padding: 6,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  strengthSection: {
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  strengthHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  strengthLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontFamily: 'Inter-Regular',
  },
  strengthValue: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklistContainer: {
    marginBottom: 20,
    backgroundColor: COLOR_GRAY_LIGHT,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  checkTextActive: {
    color: '#334155',
  },
  matchErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  matchErrorText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLOR_RED,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
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
});
