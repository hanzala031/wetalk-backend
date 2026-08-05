import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView, useAnimationState } from 'moti';
import { useLanguage } from '@/context/language-context';

const { width } = Dimensions.get('window');

// --- Types ---
interface LevelOption {
  id: string;
  label: string;
  bars: number;
}

const LEVEL_OPTIONS: LevelOption[] = [
  { id: '1', label: "I'm new to {lang}", bars: 1 },
  { id: '2', label: "I know some common words", bars: 2 },
  { id: '3', label: "I can have basic conversations", bars: 3 },
  { id: '4', label: "I can talk about various topics", bars: 4 },
  { id: '5', label: "I can discuss most topics in detail", bars: 5 },
];

// --- Sub-component: Signal/Level Icon ---
const LevelBars = ({ count, active }: { count: number; active: boolean }) => (
  <View style={styles.barsContainer}>
    {[1, 2, 3, 4, 5].map((i) => (
      <View
        key={i}
        style={[
          styles.bar,
          { height: 8 + i * 3 },
          i <= count ? { backgroundColor: active ? '#FFF' : '#0F5B7F' } : { backgroundColor: '#D1D5DB' },
        ]}
      />
    ))}
  </View>
);

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

export const OnboardingLevelScreen = () => {
  const { language } = useLocalSearchParams<{ language: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useLanguage();

  const LEVEL_KEYS: Record<string, string> = {
    '1': 'new_to',
    '2': 'common_words',
    '3': 'basic_conv',
    '4': 'talk_topics',
    '5': 'discuss_detail'
  };

  const renderLevelItem = ({ item }: { item: LevelOption }) => {
    const isSelected = selectedId === item.id;
    const translationKey = LEVEL_KEYS[item.id];
    const label = t(translationKey, { lang: language || 'English' });

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedId(item.id)}
        style={[
          styles.card,
          isSelected && styles.selectedCard,
        ]}
      >
        <LevelBars count={item.bars} active={isSelected} />
        <Text style={[styles.levelText, isSelected && styles.selectedLevelText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#D1D5DB" />
        </TouchableOpacity>
        <ProgressBar progress={35} />
      </View>

      <View style={styles.topSection}>
        <WeBotSmall />
        <View style={styles.bubbleContainer}>
           <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{t('how_much', { lang: language || 'English' })}</Text>
           </View>
           <View style={styles.bubbleTail} />
        </View>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={LEVEL_OPTIONS}
          renderItem={renderLevelItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Fixed Bottom Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={[styles.button, !selectedId && styles.buttonDisabled]}
          disabled={!selectedId}
          onPress={() => {
            router.push({
              pathname: '/onboarding-reason',
              params: { language: language || 'English' }
            });
          }}
        >
          <Text style={[styles.buttonText, !selectedId && styles.buttonTextDisabled]}>{t('continue')}</Text>
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
    backgroundColor: '#0F5B7F',
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
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 30,
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
    backgroundColor: '#1F2937',
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
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderBottomWidth: 4,
  },
  selectedCard: {
    borderColor: '#0F5B7F',
    backgroundColor: '#0F5B7F', // As seen in duolingo, selected card can be theme colored
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginRight: 15,
    width: 45,
    justifyContent: 'center',
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  levelText: {
    fontSize: 17,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
    flex: 1,
  },
  selectedLevelText: {
    color: '#FFF',
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
    backgroundColor: '#0F5B7F',
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
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    letterSpacing: 1,
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default OnboardingLevelScreen;
