import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

interface WelcomeRewardModalProps {
  visible: boolean;
  onClose: () => void;
  coinsAmount?: number;
}

export default function WelcomeRewardModal({
  visible,
  onClose,
  coinsAmount = 50,
}: WelcomeRewardModalProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Confetti / Gift & Coin Header */}
          <View style={styles.illustrationContainer}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
              style={styles.giftCoinImage}
              contentFit="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Welcome to WeTalk! 🎉</Text>
          <Text style={styles.subtitle}>
            Thank you for joining us.{'\n'}Here is your sign up bonus!
          </Text>

          {/* Green Bonus Highlight Box */}
          <View style={styles.bonusBox}>
            <View style={styles.bonusRow}>
              <Text style={styles.bonusAmount}>+{coinsAmount} WT Coins</Text>
              <Image
                source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
                style={styles.smallCoinImage}
                contentFit="contain"
              />
            </View>
            <Text style={styles.addedText}>Added to your account</Text>
          </View>

          {/* Start Action Button */}
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Great! Let's Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: Math.min(width * 0.86, 340),
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  illustrationContainer: {
    width: 75,
    height: 75,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftCoinImage: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  bonusBox: {
    backgroundColor: '#E6F4EA',
    borderRadius: 14,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C6E7CE',
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bonusAmount: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: '#10B981',
    marginRight: 6,
  },
  smallCoinImage: {
    width: 22,
    height: 22,
  },
  addedText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  button: {
    backgroundColor: '#004D73',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#004D73',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
  },
});
