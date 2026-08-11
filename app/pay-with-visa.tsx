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
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { apiClient, authConfig } from '@/lib/api-client';

const { width } = Dimensions.get('window');

export default function PayWithVisaScreen() {
  const { userToken } = useAuth();
  const params = useLocalSearchParams();

  // Dynamic values based on navigation params, default to 100 Coins / $0.99
  const coinsName = (params.coins as string) || '100 Coins';
  const priceVal = (params.price as string) || '$0.99';
  const pkgId = (params.pkgId as string) || '';

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [saveCard, setSaveCard] = useState(true);
  const [processing, setProcessing] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s?/g, '').replace(/[^0-9]/g, '');
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber('');
    }
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handlePay = async () => {
    if (!cardNumber || cardNumber.length < 19) {
      Alert.alert('Validation Error', 'Please enter a valid 16-digit card number.');
      return;
    }
    if (!expiry || expiry.length < 5) {
      Alert.alert('Validation Error', 'Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Validation Error', 'Please enter a valid CVV.');
      return;
    }
    if (!cardholderName.trim()) {
      Alert.alert('Validation Error', "Please enter the cardholder's name.");
      return;
    }
    if (!zipCode.trim()) {
      Alert.alert('Validation Error', 'Please enter your ZIP/Postal Code.');
      return;
    }

    try {
      setProcessing(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Payment Successful',
        `Thank you for your purchase. ${coinsName} have been successfully credited!`,
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

  const selectCountry = () => {
    Alert.alert(
      'Select Country',
      'Choose your billing country:',
      [
        { text: 'United States', onPress: () => setCountry('United States') },
        { text: 'Canada', onPress: () => setCountry('Canada') },
        { text: 'United Kingdom', onPress: () => setCountry('United Kingdom') },
        { text: 'Australia', onPress: () => setCountry('Australia') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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
            <View style={styles.headerTitleRow}>
              <Ionicons name="card" size={20} color="#0B2F61" style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>Pay with Visa</Text>
            </View>
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
                  <Text style={styles.subHeaderTitle}>Secure Card Payment</Text>
                  <Text style={styles.subHeaderSubtitle}>Your payment information is 100% secure</Text>
                </View>
              </View>
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
                <View style={styles.infoBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#0B2F61" style={{ marginRight: 4 }} />
                  <Text style={styles.infoBadgeText}>We never store your card details</Text>
                </View>
                <View style={styles.infoBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={[styles.infoBadgeText, { color: '#047857' }]}>SSL Encrypted</Text>
                </View>
              </View>
            </View>

            {/* Card Information Section */}
            <Text style={styles.sectionHeader}>Card Information</Text>

            <Text style={styles.fieldLabel}>Card Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={formatCardNumber}
              />
              <View style={styles.cardBrandBadge}>
                <Text style={styles.cardBrandText}>VISA</Text>
              </View>
            </View>

            <View style={styles.rowFields}>
              <View style={{ flex: 1.2, marginRight: 16 }}>
                <Text style={styles.fieldLabel}>Expiry Date</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM / YY"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={5}
                    value={expiry}
                    onChangeText={formatExpiry}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>CVV</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="123"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={3}
                    value={cvv}
                    onChangeText={setCvv}
                  />
                  <TouchableOpacity onPress={() => Alert.alert('CVV', '3-digit security code on the back of your card.')}>
                    <Ionicons name="help-circle-outline" size={18} color="#94A3B8" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Cardholder Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter cardholder name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={cardholderName}
                onChangeText={setCardholderName}
              />
            </View>

            {/* Billing Address Section */}
            <Text style={styles.sectionHeader}>Billing Address</Text>

            <Text style={styles.fieldLabel}>Country / Region</Text>
            <TouchableOpacity style={styles.dropdownSelector} onPress={selectCountry}>
              <Text style={styles.dropdownText}>{country}</Text>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>ZIP / Postal Code</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter ZIP / Postal Code"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={zipCode}
                onChangeText={setZipCode}
              />
            </View>

            {/* Checkbox Save Card */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setSaveCard(!saveCard)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
                {saveCard && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxText}>Save this card for faster payments</Text>
            </TouchableOpacity>

            {/* Encrypted Security Note Box */}
            <View style={styles.securityBox}>
              <Ionicons name="shield-checkmark" size={24} color="#0B2F61" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.securityTitle}>Your payment information is safe with us</Text>
                <Text style={styles.securitySub}>
                  We use industry-standard encryption to protect your card details and personal information.
                </Text>
              </View>
            </View>

            {/* Action Pay Button */}
            <TouchableOpacity
              style={[styles.payButton, processing && styles.payButtonDisabled]}
              onPress={handlePay}
              disabled={processing}
            >
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.payButtonText}>
                {processing ? 'Processing...' : `Pay ${priceVal}`}
              </Text>
            </TouchableOpacity>

            {/* Footer We Accept Logos */}
            <Text style={styles.weAcceptText}>We Accept</Text>
            <View style={styles.acceptLogosRow}>
              {/* Visa Card */}
              <View style={styles.logoCard}>
                <Text style={[styles.logoCardText, { color: '#1A1F71', fontWeight: '900', fontStyle: 'italic' }]}>VISA</Text>
              </View>

              {/* Mastercard Card */}
              <View style={styles.logoCard}>
                <View style={styles.mcCircles}>
                  <View style={[styles.mcCircle, { backgroundColor: '#EB001B', marginRight: -6 }]} />
                  <View style={[styles.mcCircle, { backgroundColor: '#F79E1B', opacity: 0.9 }]} />
                </View>
              </View>

              {/* Amex Card */}
              <View style={styles.logoCard}>
                <Text style={[styles.logoCardText, { color: '#0070CD', fontWeight: 'bold', fontSize: 10 }]}>AMEX</Text>
              </View>

              {/* Discover Card */}
              <View style={styles.logoCard}>
                <Text style={[styles.logoCardText, { color: '#F47A20', fontWeight: 'bold', fontSize: 9 }]}>DISCOVER</Text>
              </View>

              {/* Apple Pay Card */}
              <View style={styles.logoCard}>
                <Ionicons name="logo-apple" size={14} color="#000000" style={{ marginRight: 2 }} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#000000' }}>Pay</Text>
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
  headerTitleRow: {
    flexDirection: 'row',
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
  visaBrandLogoText: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1A1F71',
    letterSpacing: 0.5,
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
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#0B2F61',
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#0B2F61',
    marginTop: 16,
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
  cardBrandBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardBrandText: {
    fontSize: 10,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#1A1F71',
  },
  rowFields: {
    flexDirection: 'row',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0B2F61',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#0B2F61',
  },
  checkboxText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
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
  payButton: {
    backgroundColor: '#0B2F61',
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B2F61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  payButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  payButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  weAcceptText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  acceptLogosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCard: {
    width: 44,
    height: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  logoCardText: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  mcCircles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mcCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
