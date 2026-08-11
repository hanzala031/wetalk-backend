import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

interface RewardItem {
  type: string;
  amount: number;
  currentBalance: number;
}

interface RewardPopupProps {
  visible: boolean;
  rewards: RewardItem[];
  onClose: () => void;
}

export default function RewardPopup({ visible, rewards, onClose }: RewardPopupProps) {
  if (!rewards || rewards.length === 0) return null;

  // Use the balance of the last reward item as current balance
  const currentBalance = rewards[rewards.length - 1].currentBalance;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Celebrating icon header */}
          <Text style={styles.emojiHeader}>🎉</Text>
          <Text style={styles.title}>Reward Earned!</Text>

          {/* List of rewards */}
          <View style={styles.rewardsList}>
            {rewards.map((reward, index) => (
              <View key={`reward_popup_${index}`} style={styles.rewardRow}>
                <Text style={styles.rewardAmount}>+{reward.amount}</Text>
                <Text style={styles.rewardType}>WT Coins</Text>
                <Text style={styles.rewardSource}>({reward.type})</Text>
              </View>
            ))}
          </View>

          {/* Current balance section */}
          <View style={styles.divider} />
          
          <Text style={styles.balanceLabel}>Current Balance:</Text>
          <View style={styles.balanceRow}>
            <Image 
              source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
              style={styles.coinImagePopup}
              contentFit="contain"
            />
            <Text style={styles.balanceValue}>
              {currentBalance.toLocaleString()} WT Coins
            </Text>
          </View>

          {/* Continue button */}
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: width * 0.85,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  emojiHeader: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  rewardsList: {
    width: '100%',
    marginBottom: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  rewardAmount: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    color: '#10B981', // green color
  },
  rewardType: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    color: '#004D73', // primary blue
    marginLeft: 6,
  },
  rewardSource: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 6,
    alignSelf: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
    marginVertical: 16,
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  coinImagePopup: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  balanceValue: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    fontWeight: '600',
    color: '#374151',
  },
  button: {
    backgroundColor: '#004D73',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    fontWeight: '600',
  },
});
