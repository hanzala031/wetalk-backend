import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';

const { width } = Dimensions.get('window');

export default function PayWithPaypalScreen() {
  const { userToken } = useAuth();
  const params = useLocalSearchParams();

  // Dynamic values based on navigation params
  const coinsName = (params.coins as string) || '100 Coins';
  const priceVal = (params.price as string) || '$0.99';
  const pkgId = (params.pkgId as string) || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email or mobile number.');
      return;
    }
    if (!password || password.length < 4) {
      Alert.alert('Validation Error', 'Please enter a valid password.');
      return;
    }

    try {
      setProcessing(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Payment Successful',
        `Thank you for your purchase. ${coinsName} have been added to your account!`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.dismissAll();
              router.replace('/wt-coin-details');
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Payment Failed', 'An error occurred during payment processing. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleGuestCheckout = () => {
    // Navigate to pay-with-visa
    router.push({
      pathname: '/pay-with-visa',
      params: {
        coins: coinsName,
        price: priceVal,
        pkgId: pkgId,
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0B2F61" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Pay with PayPal</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Sub-Header Secure Payment Row */}
            <View style={styles.subHeaderRow}>
              <View style={styles.subHeaderLeft}>
                <Ionicons name="lock-closed" size={18} color="#0B2F61" style={{ marginRight: 8, marginTop: 2 }} />
                <View>
                  <Text style={styles.subHeaderTitle}>Secure PayPal Payment</Text>
                  <Text style={styles.subHeaderSubtitle}>Your payment information is 100% secure with PayPal.</Text>
                </View>
              </View>
              <Ionicons name="logo-paypal" size={24} color="#003087" />
            </View>

            {/* Purchase Details Card */}
            <View style={styles.purchaseCard}>
              <View style={styles.purchaseTopRow}>
                <View style={styles.purchaseCol}>
                  <Text style={styles.purchaseLabel}>You are buying</Text>
                  <View style={styles.coinRow}>
                    <Image
                      source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
                      style={styles.coinIcon}
                      contentFit="contain"
                    />
                    <Text style={styles.purchaseVal}>{coinsName}</Text>
                  </View>
                </View>
                <View style={[styles.purchaseCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.purchaseLabel}>Total Amount</Text>
                  <Text style={styles.purchaseVal}>{priceVal}</Text>
                </View>
              </View>

              <View style={styles.purchaseDivider} />

              <View style={styles.purchaseBottomRow}>
                {/* Col 1 */}
                <View style={styles.infoBadgeCol}>
                  <Ionicons name="shield-checkmark" size={16} color="#003087" />
                  <Text style={styles.infoColTitle}>PayPal Buyer Protection</Text>
                  <Text style={styles.infoColSubtitle}>Shop with confidence</Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* Col 2 */}
                <View style={styles.infoBadgeCol}>
                  <Ionicons name="lock-closed" size={15} color="#0B2F61" />
                  <Text style={styles.infoColTitle}>Secure Transactions</Text>
                  <Text style={styles.infoColSubtitle}>Your data is safe</Text>
                </View>

                <View style={styles.verticalDivider} />

                {/* Col 3 */}
                <View style={styles.infoBadgeCol}>
                  <Ionicons name="flash" size={15} color="#D97706" />
                  <Text style={styles.infoColTitle}>Instant Delivery</Text>
                  <Text style={styles.infoColSubtitle}>Coins added instantly</Text>
                </View>
              </View>
            </View>

            {/* Pay with PayPal Account Section */}
            <Text style={styles.sectionHeader}>Pay with PayPal Account</Text>
            <Text style={styles.sectionSubtitle}>Log in to your PayPal account to complete the payment</Text>

            <Text style={styles.fieldLabel}>Email or mobile number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email or mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={secureText}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <Feather name={secureText ? 'eye-off' : 'eye'} size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn} onPress={() => Alert.alert('Reset Password', 'PayPal password recovery is handled directly on PayPal.com.')}>
              <Text style={styles.forgotBtnText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login and Pay Button */}
            <TouchableOpacity
              style={[styles.payButton, processing && styles.payButtonDisabled]}
              onPress={handlePay}
              disabled={processing}
            >
              <Text style={styles.payButtonText}>
                {processing ? 'Logging in...' : `Log In and Pay ${priceVal}`}
              </Text>
            </TouchableOpacity>

            {/* Or Divider */}
            <View style={styles.orDividerRow}>
              <View style={styles.dividerLine} />
              <View style={styles.orBadge}>
                <Text style={styles.orText}>or</Text>
              </View>
              <View style={styles.dividerLine} />
            </View>

            {/* Don't have a PayPal account? */}
            <Text style={styles.sectionHeader}>Don't have a PayPal account?</Text>
            <Text style={styles.sectionSubtitle}>Checkout as a guest using your card.</Text>

            <TouchableOpacity style={styles.cardPayBtn} onPress={handleGuestCheckout}>
              <View style={styles.cardPayLeft}>
                <Ionicons name="logo-paypal" size={20} color="#003087" style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.cardPayTitle}>Pay with Debit or Credit Card</Text>
                  <Text style={styles.cardPaySubtitle}>No PayPal account required</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Security Box */}
            <View style={styles.securityBox}>
              <Ionicons name="shield-checkmark" size={24} color="#0B2F61" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.securityTitle}>Your payment is secure with PayPal</Text>
                <Text style={styles.securitySub}>
                  We use industry-leading encryption and fraud protection to keep your information safe.
                </Text>
              </View>
            </View>

            {/* Footer Wordmark and Links */}
            <View style={styles.footerRow}>
              <View style={styles.paypalWordmark}>
                <Ionicons name="logo-paypal" size={14} color="#003087" style={{ marginRight: 2 }} />
                <Text style={styles.paypalText}>PayPal</Text>
              </View>

              <View style={styles.footerLinks}>
                <TouchableOpacity onPress={() => Alert.alert('Help', 'Support is available.')}><Text style={styles.linkText}>Help</Text></TouchableOpacity>
                <Text style={styles.linkSeparator}>|</Text>
                <TouchableOpacity onPress={() => Alert.alert('Privacy', 'Privacy policy.')}><Text style={styles.linkText}>Privacy</Text></TouchableOpacity>
                <Text style={styles.linkSeparator}>|</Text>
                <TouchableOpacity onPress={() => Alert.alert('Terms', 'Terms of service.')}><Text style={styles.linkText}>Terms</Text></TouchableOpacity>
                <Text style={styles.linkSeparator}>|</Text>
                <TouchableOpacity onPress={() => Alert.alert('Contact', 'Contact Us.')}><Text style={styles.linkText}>Contact Us</Text></TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    padding: 4,
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#0B2F61',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  subHeaderTitle: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: '#0B2F61',
  },
  subHeaderSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  purchaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  purchaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  purchaseCol: {
    flex: 1,
  },
  purchaseLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  purchaseVal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0B2F61',
  },
  purchaseDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  purchaseBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBadgeCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoColTitle: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: '#0B2F61',
    marginTop: 4,
    textAlign: 'center',
  },
  infoColSubtitle: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 1,
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#0B2F61',
    marginTop: 14,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
    marginBottom: 6,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
    height: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 16,
  },
  forgotBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#0B2F61',
  },
  payButton: {
    backgroundColor: '#0B2F61',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B2F61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  payButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orBadge: {
    paddingHorizontal: 10,
  },
  orText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  cardPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#003087',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  cardPayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPayTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#003087',
  },
  cardPaySubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  securityTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#0F2C59',
  },
  securitySub: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
  },
  paypalWordmark: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paypalText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#003087',
    fontStyle: 'italic',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#0B2F61',
  },
  linkSeparator: {
    fontSize: 10,
    color: '#94A3B8',
    marginHorizontal: 6,
  },
});
