import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView, useAnimationState } from 'moti';
import { useLanguage } from '@/context/language-context';

const { width } = Dimensions.get('window');

// --- Sub-component: Progress Bar ---
const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBackground}>
      <MotiView 
        from={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'timing', duration: 1000 }}
        style={styles.progressFill}
      >
        <View style={styles.progressGlow} />
      </MotiView>
    </View>
  </View>
);

// --- Sub-component: WeBot Mascot ---
const WeBotSmall = () => {
  const blinkingState = useAnimationState({
    open: { scaleY: 1 },
    closed: { scaleY: 0.1 },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      blinkingState.transitionTo('closed');
      setTimeout(() => {
        blinkingState.transitionTo('open');
      }, 150);
    }, 1000);
    return () => clearInterval(interval);
  }, [blinkingState]);

  return (
    <MotiView
      from={{ translateY: 0 }}
      animate={{ translateY: -5 }}
      transition={{
        type: 'timing',
        duration: 2000,
        loop: true,
        repeatReverse: true,
      }}
      style={styles.botContainer}
    >
      <View style={styles.botBody}>
        <View style={styles.botFace}>
          <View style={styles.eyesRow}>
            <MotiView state={blinkingState} style={styles.eye} />
            <MotiView state={blinkingState} style={styles.eye} />
          </View>
          <View style={styles.smile} />
        </View>
        <View style={[styles.antenna, { left: -6 }]} />
        <View style={[styles.antenna, { right: -6 }]} />
      </View>
    </MotiView>
  );
};

interface AchievementItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  iconColor: string;
}

const AchievementItem = ({ icon, title, description, iconColor }: AchievementItemProps) => (
  <View style={styles.achievementItem}>
    <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon} size={28} color={iconColor} />
    </View>
    <View style={styles.achievementTextContainer}>
      <Text style={styles.achievementTitle}>{title}</Text>
      <Text style={styles.achievementDescription}>{description}</Text>
    </View>
  </View>
);

export const OnboardingAchieveScreen = () => {
  const { language } = useLocalSearchParams<{ language: string }>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#D1D5DB" />
        </TouchableOpacity>
        <ProgressBar progress={75} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topSection}>
          <WeBotSmall />
          <View style={styles.bubbleContainer}>
             <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{t('achieve_title')}</Text>
             </View>
             <View style={styles.bubbleTail} />
          </View>
        </View>

        <View style={styles.achievementsList}>
          <AchievementItem 
            icon="chatbubbles-outline" 
            title={t('achieve_1_title')} 
            description={t('achieve_1_desc')}
            iconColor="#8B5CF6"
          />
          <AchievementItem 
            icon="text-outline" 
            title={t('achieve_2_title')} 
            description={t('achieve_2_desc')}
            iconColor="#3B82F6"
          />
          <AchievementItem 
            icon="time-outline" 
            title={t('achieve_3_title')} 
            description={t('achieve_3_desc')}
            iconColor="#F59E0B"
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.button}
          onPress={() => {
            router.push({
              pathname: '/onboarding-source',
              params: { language: language || 'English' }
            });
          }}
        >
          <Text style={styles.buttonText}>{t('continue').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    height: 70,
  },
  backButton: {
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
  },
  progressBackground: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#005073',
    borderRadius: 7,
  },
  progressGlow: {
    position: 'absolute',
    top: 2,
    left: '10%',
    width: '80%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 40,
  },
  botContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  botBody: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botFace: {
    width: 55,
    height: 45,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 30,
    marginBottom: 4,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
  },
  smile: {
    width: 15,
    height: 8,
    borderBottomWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 8,
    opacity: 1,
  },
  antenna: {
    position: 'absolute',
    top: 25,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  bubbleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flex: 1,
  },
  bubbleText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
  },
  bubbleTail: {
    position: 'absolute',
    left: -10,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#E5E7EB',
  },
  achievementsList: {
    paddingHorizontal: 24,
    gap: 25,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  achievementTextContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#005073',
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    letterSpacing: 1,
  },
});
