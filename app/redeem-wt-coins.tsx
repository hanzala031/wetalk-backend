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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { apiClient, authConfig } from '@/lib/api-client';

const { width } = Dimensions.get('window');

interface RewardOption {
  id: string;
  title: string;
  subtitle: string;
  cost: number;
  iconName: string;
  iconType: 'ionicons' | 'material';
  iconColor: string;
  bgColor: string;
  badge?: 'POPULAR';
}

export default function RedeemWtCoinsScreen() {
  const { userToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(50); // Matches real default coins, updated dynamically
  const [selectedReward, setSelectedReward] = useState<RewardOption | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [codeApplied, setCodeApplied] = useState(false);

  const rewards: RewardOption[] = [
    {
      id: 'prem_7',
      title: 'Premium 7 Days',
      subtitle: 'Unlock all premium features for 7 days.',
      cost: 1000,
      iconName: 'crown',
      iconType: 'material',
      iconColor: '#D97706',
      bgColor: '#FEF3C7',
      badge: 'POPULAR',
    },
    {
      id: 'prem_30',
      title: 'Premium 30 Days',
      subtitle: 'Unlock all premium features for 30 days.',
      cost: 3500,
      iconName: 'crown',
      iconType: 'material',
      iconColor: '#2563EB',
      bgColor: '#DBEAFE',
    },
    {
      id: 'ai_speaking',
      title: 'AI Speaking Pack',
      subtitle: 'Advanced AI speaking practice pack.',
      cost: 1500,
      iconName: 'mic',
      iconType: 'ionicons',
      iconColor: '#2563EB',
      bgColor: '#DBEAFE',
    },
    {
      id: 'gems_50',
      title: '50 Gems',
      subtitle: 'Get 50 gems to unlock special items.',
      cost: 500,
      iconName: 'diamond',
      iconType: 'material',
      iconColor: '#06B6D4',
      bgColor: '#ECFEFF',
    },
    {
      id: 'no_ads',
      title: 'Remove Ads',
      subtitle: 'Enjoy learning without any ads.',
      cost: 2000,
      iconName: 'shield-checkmark',
      iconType: 'ionicons',
      iconColor: '#1E3A8A',
      bgColor: '#E0E7FF',
    },
    {
      id: 'mystery',
      title: 'Mystery Reward',
      subtitle: 'Redeem for a random exciting reward.',
      cost: 800,
      iconName: 'gift',
      iconType: 'ionicons',
      iconColor: '#2563EB',
      bgColor: '#DBEAFE',
    },
  ];

  // Set default package (Premium 7 Days)
  useEffect(() => {
    const defaultReward = rewards.find(r => r.id === 'prem_7');
    if (defaultReward) {
      setSelectedReward(defaultReward);
    }
  }, []);

  const fetchBalance = async () => {
    if (!userToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get('/user/wt-coins/details', authConfig(userToken));
      if (res.data && res.data.success) {
        setBalance(res.data.currentBalance ?? 50);
      } else {
        setBalance(50);
      }
    } catch (e) {
      console.warn('Could not fetch real balance:', e);
      setBalance(50);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userToken]);

  const handleApplyCode = () => {
    if (!redeemCode.trim()) {
      Alert.alert('Error', 'Please enter a redeem code');
      return;
    }
    if (redeemCode.trim().toUpperCase() === 'FREE500') {
      setCodeApplied(true);
      setBalance(prev => prev + 500);
      Alert.alert('Success', 'Redeem code applied! +500 WT Coins credited to your account.');
      setRedeemCode('');
    } else {
      Alert.alert('Invalid Code', 'The code you entered is invalid or expired.');
    }
  };

  const handleRedeem = () => {
    if (!selectedReward) return;

    if (balance < selectedReward.cost) {
      Alert.alert('Insufficient Balance', 'You do not have enough WT Coins to redeem this reward.');
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Would you like to redeem "${selectedReward.title}" for ${selectedReward.cost.toLocaleString()} WT Coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            setBalance(prev => prev - selectedReward.cost);
            Alert.alert('Success', `"${selectedReward.title}" has been successfully redeemed!`, [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
        },
      ]
    );
  };

  const showHelpInfo = () => {
    Alert.alert(
      'Redeem Rewards Help',
      'Select any reward from the list above. Ensure you have enough WT Coins balance to redeem the item. Your remaining balance will be calculated dynamically below.',
      [{ text: 'Got it!' }]
    );
  };

  const remainingBalance = selectedReward ? balance - selectedReward.cost : balance;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.headerButton, { alignItems: 'flex-start' }]}>
            <Ionicons name="arrow-back" size={24} color="#004D73" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Redeem WT Coins</Text>
          <TouchableOpacity onPress={showHelpInfo} style={[styles.headerButton, { alignItems: 'flex-end' }]}>
            <Ionicons name="help-circle-outline" size={26} color="#004D73" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#004D73" />
            <Text style={styles.loaderText}>Loading details...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Top Balance Card */}
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
                source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785311120/WhatsApp_Image_2026-07-29_at_12.31.57_PM_jet8kr.jpg' }}
                style={styles.largeCoinImage}
                contentFit="contain"
              />
            </View>

            {/* Choose a Reward Section */}
            <Text style={styles.sectionTitle}>Choose a Reward</Text>
            <Text style={styles.sectionSubtitle}>
              Redeem your coins for exciting rewards and premium benefits.
            </Text>

            <View style={styles.grid}>
              {rewards.map((item) => {
                const isSelected = selectedReward?.id === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.rewardCard,
                      isSelected && styles.rewardCardSelected,
                    ]}
                    onPress={() => setSelectedReward(item)}
                  >
                    {item.badge && (
                      <View style={styles.pkgBadge}>
                        <Text style={styles.pkgBadgeText}>{item.badge}</Text>
                      </View>
                    )}

                    <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                      {item.iconType === 'material' ? (
                        <MaterialCommunityIcons name={item.iconName as any} size={24} color={item.iconColor} />
                      ) : (
                        <Ionicons name={item.iconName as any} size={22} color={item.iconColor} />
                      )}
                    </View>

                    <Text style={styles.rewardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.rewardSubtitle} numberOfLines={2}>
                      {item.subtitle}
                    </Text>

                    <View style={[
                      styles.priceButton,
                      isSelected ? styles.priceButtonSelected : styles.priceButtonUnselected,
                    ]}>
                      <Image
                        source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
                        style={styles.priceCoinIcon}
                        contentFit="contain"
                      />
                      <Text style={[
                        styles.priceText,
                        isSelected ? styles.priceTextSelected : styles.priceTextUnselected,
                      ]}>
                        {item.cost.toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Redemption Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Redemption Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryColumn}>
                  <Ionicons name="gift-outline" size={20} color="#004D73" />
                  <Text style={styles.summaryLbl}>Selected Reward</Text>
                  <Text style={styles.summaryVal} numberOfLines={1}>
                    {selectedReward ? selectedReward.title : 'None'}
                  </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryColumn}>
                  <Image
                    source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
                    style={styles.summaryCoinIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.summaryLbl}>Required Coins</Text>
                  <Text style={styles.summaryVal}>
                    {selectedReward ? selectedReward.cost.toLocaleString() : '0'}
                  </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryColumn}>
                  <Image
                    source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
                    style={styles.summaryCoinIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.summaryLbl}>Remaining Balance</Text>
                  <Text style={[styles.summaryVal, remainingBalance < 0 && styles.negativeText]}>
                    {remainingBalance.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
            {/* Bottom Redeem Now Button */}
            <TouchableOpacity
              style={[
                styles.redeemButton,
                selectedReward && balance < selectedReward.cost && styles.redeemButtonDisabled,
              ]}
              onPress={handleRedeem}
              disabled={selectedReward ? balance < selectedReward.cost : true}
            >
              <Ionicons name="gift-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.redeemButtonText}>Redeem Now</Text>
            </TouchableOpacity>

          </ScrollView>
        )}
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
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    textAlign: 'center',
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rewardCard: {
    width: (width - 44) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
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
  rewardCardSelected: {
    borderColor: '#004D73',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  pkgBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#004D73',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pkgBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  rewardTitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
    textAlign: 'center',
    height: 32,
  },
  rewardSubtitle: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    height: 28,
    marginTop: 2,
    marginBottom: 8,
  },
  priceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 5,
    borderRadius: 10,
  },
  priceButtonUnselected: {
    backgroundColor: '#F1F5F9',
  },
  priceButtonSelected: {
    backgroundColor: '#004D73',
  },
  priceCoinIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  priceText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },
  priceTextUnselected: {
    color: '#0F172A',
  },
  priceTextSelected: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D0E5FF',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryColumn: {
    alignItems: 'center',
    flex: 1,
  },
  summaryCoinIcon: {
    width: 20,
    height: 20,
  },
  summaryLbl: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 2,
  },
  summaryVal: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#004D73',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#D0E5FF',
  },
  negativeText: {
    color: '#EF4444',
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  codeTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    marginBottom: 2,
  },
  codeSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
  },
  codeInputRow: {
    flexDirection: 'row',
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
  },
  codeApplyButton: {
    backgroundColor: '#004D73',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  codeApplyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
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
    marginBottom: 24,
  },
  whyItem: {
    alignItems: 'center',
    width: (width - 32) / 4,
  },
  whyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  whyText: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  redeemButton: {
    backgroundColor: '#004D73',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004D73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  redeemButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  redeemButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
});
