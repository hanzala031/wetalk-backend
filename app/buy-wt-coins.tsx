import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { apiClient, authConfig } from '@/lib/api-client';

const { width } = Dimensions.get('window');

interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  price: string;
  subtitle: string;
  priceVal: number;
  badge?: 'MOST POPULAR' | 'BEST VALUE';
  imageUri: string;
}

export default function BuyWtCoinsScreen() {
  const { userToken } = useAuth();
  const [balance, setBalance] = useState(50);
  const [selectedPkg, setSelectedPkg] = useState<CoinPackage | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const packages: CoinPackage[] = [
    {
      id: 'pkg_100',
      coins: 100,
      bonus: 0,
      price: '$0.99',
      priceVal: 0.99,
      subtitle: 'Best for Beginners',
      imageUri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png',
    },
    {
      id: 'pkg_250',
      coins: 250,
      bonus: 20,
      price: '$1.99',
      priceVal: 1.99,
      subtitle: '+20 Bonus Coins',
      badge: 'MOST POPULAR',
      imageUri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png',
    },
    {
      id: 'pkg_500',
      coins: 500,
      bonus: 75,
      price: '$3.99',
      priceVal: 3.99,
      subtitle: '+75 Bonus Coins',
      imageUri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png',
    },
    {
      id: 'pkg_1000',
      coins: 1000,
      bonus: 200,
      price: '$6.99',
      priceVal: 6.99,
      subtitle: '+200 Bonus Coins',
      imageUri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png',
    },
    {
      id: 'pkg_2500',
      coins: 2500,
      bonus: 700,
      price: '$14.99',
      priceVal: 14.99,
      subtitle: '+700 Bonus Coins',
      imageUri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png',
    },
    {
      id: 'pkg_5000',
      coins: 5000,
      bonus: 1800,
      price: '$24.99',
      priceVal: 24.99,
      subtitle: '+1800 Bonus Coins',
      badge: 'BEST VALUE',
      imageUri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png',
    },
  ];

  // Set default package (250 Coins)
  useEffect(() => {
    const defaultPkg = packages.find(p => p.id === 'pkg_250');
    if (defaultPkg) {
      setSelectedPkg(defaultPkg);
    }
  }, []);

  const fetchBalance = async () => {
    if (!userToken) return;
    try {
      const res = await apiClient.get('/user/wt-coins/details', authConfig(userToken));
      if (res.data && res.data.success) {
        setBalance(res.data.currentBalance ?? 50);
      }
    } catch (e) {
      console.warn('Could not fetch real balance for header:', e);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userToken]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'WETALK10') {
      setPromoApplied(true);
      setDiscount(0.1); // 10% discount
      Alert.alert('Promo Code Applied', '10% discount has been applied to your purchase!');
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid promo code (e.g. WETALK10).');
    }
  };

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    
    const finalPriceVal = selectedPkg.priceVal * (1 - discount);
    const finalPriceStr = `$${finalPriceVal.toFixed(2)}`;

    Alert.alert(
      'Confirm Purchase',
      `Would you like to buy the ${selectedPkg.coins} Coins Package for ${finalPriceStr}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Buy', 
          onPress: () => {
            Alert.alert('Success', 'WT Coins successfully purchased & credited to your account!', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const handleVisaPress = () => {
    if (!selectedPkg) {
      Alert.alert('Select Package', 'Please select a coin package first.');
      return;
    }
    const finalPrice = (selectedPkg.priceVal * (1 - discount)).toFixed(2);
    router.push({
      pathname: '/pay-with-visa',
      params: {
        coins: `${selectedPkg.coins + selectedPkg.bonus} Coins`,
        price: `$${finalPrice}`,
        pkgId: selectedPkg.id,
      }
    });
  };

  const handlePaypalPress = () => {
    if (!selectedPkg) {
      Alert.alert('Select Package', 'Please select a coin package first.');
      return;
    }
    const finalPrice = (selectedPkg.priceVal * (1 - discount)).toFixed(2);
    router.push({
      pathname: '/pay-with-paypal',
      params: {
        coins: `${selectedPkg.coins + selectedPkg.bonus} Coins`,
        price: `$${finalPrice}`,
        pkgId: selectedPkg.id,
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#004D73" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy WT Coins</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Your Current Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceCardLeft}>
              <Text style={styles.balanceLabel}>Your Current Balance</Text>
              <View style={styles.balanceRow}>
                <Image 
                  source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
                  style={styles.miniCoin}
                  contentFit="contain"
                />
                <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
              </View>
              <Text style={styles.balanceSubtitle}>WT Coins</Text>
            </View>
            <Image 
              source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785308073/WhatsApp_Image_2026-07-29_at_11.21.08_AM_qvblsp.jpg' }}
              style={styles.largeCoinImage}
              contentFit="contain"
            />
          </View>

          {/* Section: Choose a Coin Package */}
          <Text style={styles.sectionTitle}>Choose a Coin Package</Text>
          
          <View style={styles.grid}>
            {packages.map((pkg) => {
              const isSelected = selectedPkg?.id === pkg.id;

              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.pkgCard,
                    isSelected && styles.pkgCardSelected,
                    isSelected && pkg.badge === 'MOST POPULAR' && styles.pkgCardSelectedPopular,
                    isSelected && pkg.badge === 'BEST VALUE' && styles.pkgCardSelectedBest,
                  ]}
                  onPress={() => setSelectedPkg(pkg)}
                >
                  {pkg.badge && (
                    <View style={[
                      styles.pkgBadge,
                      pkg.badge === 'MOST POPULAR' ? styles.pkgBadgePopular : styles.pkgBadgeBest
                    ]}>
                      <Text style={styles.pkgBadgeText}>
                        {pkg.badge === 'MOST POPULAR' ? '🔥 MOST POPULAR' : '👑 BEST VALUE'}
                      </Text>
                    </View>
                  )}
                  
                  <Image 
                    source={{ uri: pkg.imageUri }}
                    style={styles.pkgCoinImage}
                    contentFit="contain"
                  />
                  
                  <Text style={styles.pkgCoins}>{pkg.coins} Coins</Text>
                  <Text style={[
                    styles.pkgSubtitle,
                    pkg.bonus > 0 && styles.pkgSubtitleBonus
                  ]}>
                    {pkg.subtitle}
                  </Text>
                  
                  <View style={[
                    styles.pkgButton,
                    isSelected ? styles.pkgButtonSelected : styles.pkgButtonUnselected
                  ]}>
                    <Text style={[
                      styles.pkgButtonText,
                      isSelected ? styles.pkgButtonTextSelected : styles.pkgButtonTextUnselected
                    ]}>
                      {pkg.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Package Details / Info Card */}
          {selectedPkg && (
            <View style={styles.selectedDetailsCard}>
              <View style={styles.selectedTitleRow}>
                <Ionicons name="cart-outline" size={20} color="#004D73" />
                <Text style={styles.selectedTitleText}>Selected Package</Text>
              </View>
              
              <View style={styles.selectedStatsRow}>
                <View style={styles.selectedStat}>
                  <Text style={styles.selectedStatVal}>
                    {selectedPkg.coins} Coins
                  </Text>
                  <Text style={styles.selectedStatLbl}>Base Coins</Text>
                </View>
                
                <View style={styles.selectedDivider} />
                
                <View style={styles.selectedStat}>
                  <Text style={[styles.selectedStatVal, { color: '#16A34A' }]}>
                    +{selectedPkg.bonus} Coins
                  </Text>
                  <Text style={styles.selectedStatLbl}>Bonus</Text>
                </View>
                
                <View style={styles.selectedDivider} />
                
                <View style={styles.selectedStat}>
                  <Text style={[styles.selectedStatVal, { color: '#16A34A' }]}>
                    {selectedPkg.coins + selectedPkg.bonus} Coins
                  </Text>
                  <Text style={styles.selectedStatLbl}>Total</Text>
                </View>
              </View>
            </View>
          )}

          {/* Section: Payment Method */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity style={styles.paymentRow} onPress={handleVisaPress}>
            <View style={styles.paymentLeft}>
              <Ionicons name="card" size={24} color="#004D73" />
              <Text style={styles.paymentText}>Visa **** 9821</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.paymentRow} onPress={handlePaypalPress}>
            <View style={styles.paymentLeft}>
              <Ionicons name="logo-paypal" size={24} color="#003087" style={{ width: 24 }} />
              <Text style={styles.paymentText}>PayPal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>

          {/* Promo Code Input */}
          <View style={styles.promoContainer}>
            <View style={styles.promoInputWrapper}>
              <Ionicons name="pricetag-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.promoInput}
                placeholder="Enter Promo Code"
                placeholderTextColor="#94A3B8"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
            </View>
            <TouchableOpacity style={styles.promoApplyButton} onPress={handleApplyPromo}>
              <Text style={styles.promoApplyText}>APPLY</Text>
            </TouchableOpacity>
          </View>

          {/* Buy Button */}
          {selectedPkg && (
            <TouchableOpacity style={styles.buyButton} onPress={handlePurchase}>
              <Text style={styles.buyButtonText}>
                Buy Now • ${(selectedPkg.priceVal * (1 - discount)).toFixed(2)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Footer Text */}
          <View style={styles.footerContainer}>
            <View style={styles.footerSecure}>
              <Ionicons name="lock-closed" size={12} color="#94A3B8" />
              <Text style={styles.footerSecureText}>Protected by Secure Payment</Text>
            </View>
            <Text style={styles.footerAgreement}>
              By purchasing you agree to the Terms & Privacy Policy.
            </Text>
          </View>
        </ScrollView>
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
  headerButton: {
    padding: 4,
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    textAlign: 'center',
    flex: 1,
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  balanceCardLeft: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  miniCoin: {
    width: 22,
    height: 22,
    marginRight: 6,
  },
  balanceValue: {
    fontSize: 30,
    fontFamily: 'Inter-Bold',
    color: '#004D73',
  },
  balanceSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  largeCoinImage: {
    width: 140,
    height: 140,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    marginBottom: 12,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pkgCard: {
    width: (width - 44) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  pkgCardSelected: {
    borderColor: '#004D73',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  pkgCardSelectedPopular: {
    borderColor: '#004D73',
    borderWidth: 2.5,
  },
  pkgCardSelectedBest: {
    borderColor: '#D97706',
    borderWidth: 2.5,
  },
  pkgBadge: {
    position: 'absolute',
    top: -10,
    left: 4,
    right: 4,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pkgBadgePopular: {
    backgroundColor: '#004D73',
  },
  pkgBadgeBest: {
    backgroundColor: '#D97706',
  },
  pkgBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  pkgCoinImage: {
    width: 44,
    height: 44,
    marginTop: 8,
    marginBottom: 6,
  },
  pkgCoins: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  pkgSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  pkgSubtitleBonus: {
    color: '#16A34A',
    fontFamily: 'Inter-Medium',
  },
  pkgButton: {
    width: '100%',
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pkgButtonUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#004D73',
  },
  pkgButtonSelected: {
    backgroundColor: '#004D73',
  },
  pkgButtonText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
  },
  pkgButtonTextUnselected: {
    color: '#004D73',
  },
  pkgButtonTextSelected: {
    color: '#FFFFFF',
  },
  selectedDetailsCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D0E5FF',
    marginBottom: 20,
  },
  selectedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedTitleText: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    marginLeft: 6,
  },
  selectedStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  selectedStat: {
    alignItems: 'center',
  },
  selectedStatVal: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  selectedStatLbl: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  selectedDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D0E5FF',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginLeft: 12,
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentHalfButton: {
    width: (width - 44) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentHalfText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginLeft: 8,
  },
  whyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  whyTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    marginBottom: 12,
    textAlign: 'center',
  },
  whyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  whyItem: {
    alignItems: 'center',
    width: (width - 64) / 5,
  },
  whyIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  whyText: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  promoInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
  },
  promoInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
    paddingVertical: 0,
  },
  promoApplyButton: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#004D73',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  promoApplyText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
  },
  buyButton: {
    backgroundColor: '#004D73',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#004D73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  buyButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  footerSecure: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  footerSecureText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 4,
  },
  footerAgreement: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
