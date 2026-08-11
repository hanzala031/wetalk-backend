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
import { router } from 'expo-router';
import { MotiView, useAnimationState } from 'moti';
import { useLanguage } from '@/context/language-context';

const { width } = Dimensions.get('window');

// --- Types ---
interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { id: '1', name: 'English', nativeName: 'UK English', flag: '🇬🇧' },
  { id: '2', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { id: '3', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { id: '4', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { id: '5', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { id: '6', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { id: '7', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { id: '8', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { id: '9', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { id: '10', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { id: '11', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { id: '12', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { id: '13', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { id: '14', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { id: '15', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

// --- Sub-component: Duolingo-style Progress Bar ---
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

export const OnboardingLanguageScreen = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { setLanguage, t } = useLanguage();

  const renderLanguageItem = ({ item }: { item: Language }) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedId(item.id)}
        style={[
          styles.card,
          isSelected && styles.selectedCard,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.flagContainer}>
            <Text style={styles.flag}>{item.flag}</Text>
          </View>
          <Text style={styles.languageText}>
            {item.name}
            <Text style={styles.nativeText}>
              {' | '}
              {item.nativeName}
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Progress Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#D1D5DB" />
        </TouchableOpacity>
        <ProgressBar progress={20} />
      </View>

      <View style={styles.topSection}>
        <WeBotSmall />
        <View style={styles.bubbleContainer}>
           <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{t('what_learn')}</Text>
           </View>
           <View style={styles.bubbleTail} />
        </View>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Start your language journey here</Text>
            <Ionicons name="chevron-up" size={20} color="#D1D5DB" />
        </View>

        <FlatList
          data={LANGUAGES}
          renderItem={renderLanguageItem}
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
          onPress={async () => {
            const selectedLang = LANGUAGES.find(l => l.id === selectedId);
            if (selectedLang) {
              await setLanguage(selectedLang.name);
            }
            router.push({
              pathname: '/onboarding-level',
              params: { language: selectedLang?.name || 'English' }
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
    marginBottom: 20,
  },
  // --- Bot Styles ---
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
  // --- Bubble Styles ---
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
  // --- List Styles ---
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: '#111827',
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderBottomWidth: 4, // 3D effect
  },
  selectedCard: {
    borderColor: '#0F5B7F',
    backgroundColor: '#F2F8FF',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    width: 45,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  flag: {
    fontSize: 22,
  },
  languageText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
  },
  nativeText: {
    color: '#6B7280',
    fontFamily: 'Nunito-Bold',
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

export default OnboardingLanguageScreen;
