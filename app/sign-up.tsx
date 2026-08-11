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
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, AntDesign, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/context/language-context';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { useAuth } from '@/context/auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

// Color Palette
const BG_WHITE = '#FFFFFF';
const COLOR_PRIMARY_BLUE = '#004D73';
const COLOR_GRAY_BG = '#F3F4F6';
const COLOR_BORDER = '#E5E7EB';
const COLOR_ERROR = '#EF4444';
const COLOR_SUCCESS = '#10B981';
const TEXT_DARK = '#1F2937';
const TEXT_MUTED = '#6B7280';

// ─── Validation Helpers ──────────────────────────────────────────────────────

const isEmailValid = (emailStr: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(emailStr.trim());
};

const pwdChecks = (pwd: string) => ({
  length:    pwd.length >= 8,
  uppercase: /[A-Z]/.test(pwd),
  lowercase: /[a-z]/.test(pwd),
  number:    /[0-9]/.test(pwd),
  special:   /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
});

const isPasswordStrong = (pwd: string) => {
  const c = pwdChecks(pwd);
  return c.length && c.uppercase && c.lowercase && c.number && c.special;
};

// ─── Validation Rule Row ─────────────────────────────────────────────────────

const RuleRow = ({ met, label }: { met: boolean; label: string }) => (
  <View style={ruleStyles.row}>
    <Ionicons
      name={met ? 'checkmark-circle' : 'close-circle'}
      size={14}
      color={met ? COLOR_SUCCESS : COLOR_ERROR}
    />
    <Text style={[ruleStyles.label, { color: met ? COLOR_SUCCESS : COLOR_ERROR }]}>
      {label}
    </Text>
  </View>
);

const ruleStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  label: { fontFamily: 'Inter-Regular', fontSize: 11.5, marginLeft: 5 },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SignUpScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms]       = useState(false);

  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading]                     = useState(false);

  // "touched" flags — only show errors after user has interacted with field
  const [nameTouched,    setNameTouched]    = useState(false);
  const [emailTouched,   setEmailTouched]   = useState(false);
  const [pwdTouched,     setPwdTouched]     = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const { t } = useLanguage();
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth();
  const insets = useSafeAreaInsets();

  // Derived validation state
  const checks        = pwdChecks(password);
  const nameError     = nameTouched && fullName.trim().length === 0;
  const emailError    = emailTouched && !isEmailValid(email);
  const pwdStrong     = isPasswordStrong(password);
  const pwdError      = pwdTouched && !pwdStrong;
  const confirmError  = confirmTouched && confirmPassword !== password;

  const isFormValid =
    fullName.trim().length > 0 &&
    isEmailValid(email) &&
    pwdStrong &&
    password === confirmPassword &&
    agreeToTerms;

  const { signup } = useAuth();

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSignUp = async () => {
    // Touch all fields so errors show
    setNameTouched(true);
    setEmailTouched(true);
    setPwdTouched(true);
    setConfirmTouched(true);

    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const data = await signup(
        fullName.trim(),
        email.trim().toLowerCase(),
        password
      );

      if (data.success) {
        await AsyncStorage.setItem('is_new_user_signup', 'true');
        router.push({ pathname: '/profile-setup', params: { name: fullName.trim() } });
      } else {
        Alert.alert('Signup Failed', data.message || 'Something went wrong');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Server connection error. Please make sure your backend is running.';
      Alert.alert('Signup Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 10 }]}
      >
        <Ionicons name="arrow-back" size={24} color={COLOR_PRIMARY_BLUE} />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 50 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.brandContainer}>
            <Image source={require('../assets/images/logo.png')} style={styles.logoIconImage} contentFit="contain" />
          </View>

          {/* Title */}
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.welcomeTitle}>Create Your Account</ThemedText>
            <ThemedText style={styles.welcomeSubtext}>Start your learning journey with WeTalk</ThemedText>
          </View>

          {/* ── Form Card ─────────────────────────────────────────────────── */}
          <View style={styles.cardContainer}>

            {/* ── Full Name ── */}
            <View style={[styles.inputContainer, nameError && styles.inputError]}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="account-outline" size={20} color={nameError ? COLOR_ERROR : COLOR_PRIMARY_BLUE} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                onBlur={() => setNameTouched(true)}
              />
            </View>
            {nameError && (
              <Text style={styles.errorText}>Please enter your full name</Text>
            )}

            {/* ── Email ── */}
            <View style={[styles.inputContainer, emailError && styles.inputError]}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="email-outline" size={20} color={emailError ? COLOR_ERROR : COLOR_PRIMARY_BLUE} />
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
                onBlur={() => setEmailTouched(true)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {emailError && (
              <Text style={styles.errorText}>Email must contain letters, numbers and @ symbol</Text>
            )}

            {/* ── Password ── */}
            <View style={[styles.inputContainer, pwdError && styles.inputError]}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={pwdError ? COLOR_ERROR : COLOR_PRIMARY_BLUE} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                onBlur={() => setPwdTouched(true)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {/* bottom indicator bar */}
              {password.length > 0 && (
                <View style={[styles.indicatorBar, { backgroundColor: pwdStrong ? COLOR_SUCCESS : COLOR_ERROR }]} />
              )}
            </View>

            {/* Password checklist — shown as soon as user starts typing */}
            {pwdTouched && password.length > 0 && !pwdStrong && (
              <View style={styles.pwdChecklist}>
                <RuleRow met={checks.length}    label="Be at least 8 characters long" />
                <RuleRow met={checks.uppercase} label="At least one uppercase letter (A–Z)" />
                <RuleRow met={checks.lowercase} label="At least one lowercase letter (a–z)" />
                <RuleRow met={checks.number}    label="At least one number (0–9)" />
                <RuleRow met={checks.special}   label="At least one special character (!@#$%^&*)" />
              </View>
            )}

            {/* ── Confirm Password ── */}
            <View style={[styles.inputContainer, confirmError && styles.inputError]}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={confirmError ? COLOR_ERROR : COLOR_PRIMARY_BLUE} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => setConfirmTouched(true)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {confirmPassword.length > 0 && (
                <View style={[styles.indicatorBar, { backgroundColor: (confirmPassword === password) ? COLOR_SUCCESS : COLOR_ERROR }]} />
              )}
            </View>
            {confirmError && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}

            {/* ── Terms Checkbox ── */}
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

            {/* ── Sign Up Button ── */}
            <TouchableOpacity
              activeOpacity={isFormValid ? 0.88 : 1}
              style={[styles.signUpButton, !isFormValid && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={[styles.signUpButtonText, !isFormValid && styles.signUpButtonTextDisabled]}>
                  Sign Up
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <ThemedText style={styles.orText}>or</ThemedText>
              <View style={styles.line} />
            </View>

            {/* Social Buttons */}
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

            {/* Footer */}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    marginBottom: 14,
    paddingHorizontal: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: COLOR_ERROR,
    backgroundColor: '#FFF5F5',
  },
  indicatorBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11.5,
    color: COLOR_ERROR,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  pwdChecklist: {
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
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
    backgroundColor: '#CBD5E1',
  },
  signUpButtonText: {
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  signUpButtonTextDisabled: {
    color: '#94A3B8',
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
