import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '@/lib/api-client';

const { width, height } = Dimensions.get('window');

const NAVY = '#004D73';
const BG = '#F5F8FF';
const WHITE = '#FFFFFF';
const TEXT_DARK = '#0F172A';
const TEXT_GRAY = '#6B7280';
const LIGHT_BLUE = '#EDF4FF';
const BORDER_COLOR = '#E2E8F0';

const VOCAB_WORDS = [
  {
    word: 'Ephemerality',
    phonetic: '/ɪˌfem.əˈræl.ɪ.ti/',
    definition: 'The state of lasting for a very short time; transience.',
    tip: 'Try using the word "Ephemerality" as a bubble or a mnemonic relay to strengthen your memory anchor.',
  },
  {
    word: 'Serendipity',
    phonetic: '/ˌser.ənˈdɪp.ɪ.ti/',
    definition: 'The occurrence of events by chance in a happy or beneficial way.',
    tip: 'Picture a serene dip in the water — a happy accident that leads to joy and discovery.',
  },
  {
    word: 'Mellifluous',
    phonetic: '/məˈlɪf.lu.əs/',
    definition: 'Sweet or musical; pleasant to hear.',
    tip: 'Think of "mellow" + "fluent" — a voice that flows smoothly like honey.',
  },
  {
    word: 'Perspicacious',
    phonetic: '/ˌpɜː.spɪˈkeɪ.ʃəs/',
    definition: 'Having a ready insight into things; shrewd.',
    tip: 'Imagine someone with a "periscope" who sees through things clearly and quickly.',
  },
  {
    word: 'Surreptitious',
    phonetic: '/ˌsʌr.əpˈtɪʃ.əs/',
    definition: 'Kept secret, especially because it would not be approved of.',
    tip: 'Think "secret" + "reptile" — sneaking quietly like a lizard without being noticed.',
  },
];

export default function VocabularyMaster() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [words, setWords] = useState<any[]>(VOCAB_WORDS);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    apiClient.get('/practice/vocabulary')
      .then((res) => {
        if (res.data && res.data.success && res.data.flashcards) {
          setWords(res.data.flashcards);
          const initialMastered = res.data.masteredWords || [];
          setMasteredCount(initialMastered.length);
        }
      })
      .catch((err) => {
        console.error('Error fetching vocabulary:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalWords = words.length;
  const doneCount = Math.min(masteredCount, totalWords);
  const progressPct = totalWords > 0 ? Math.min((doneCount / totalWords) * 100, 100) : 0;

  const currentWord = words[currentIndex] || {
    id: 'fc_fallback',
    word: 'Practice',
    phonetic: '/ˈpræk.tɪs/',
    definition: 'Perform an activity or exercise a skill repeatedly or regularly in order to acquire or maintain proficiency in it.',
    tip: 'Practice makes perfect!'
  };

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const goNext = async (action: 'mastered' | 'review') => {
    const activeCard = words[currentIndex];
    if (!activeCard) return;

    if (action === 'mastered') {
      try {
        await apiClient.post('/practice/vocabulary/master', { id: activeCard.id });
      } catch (err) {
        console.warn('Error marking word as mastered:', err);
      }
      
      setMasteredCount(prev => Math.max(prev, currentIndex + 1));
      
      if (currentIndex < totalWords - 1) {
        setCurrentIndex(i => i + 1);
        flipAnim.setValue(0);
        setIsFlipped(false);
      } else {
        setMasteredCount(totalWords);
        Alert.alert('Congratulations!', 'You have completed all flashcards in this session!');
      }
    } else {
      // Review Later -> Save card ID to user.savedWords
      try {
        await apiClient.post('/practice/vocabulary/save', { id: activeCard.id });
      } catch (err) {
        console.warn('Error saving word for review:', err);
      }
      
      Alert.alert('Saved to Review', `"${activeCard.word}" will be saved for review later!`);
      
      if (currentIndex < totalWords - 1) {
        setCurrentIndex(i => i + 1);
        flipAnim.setValue(0);
        setIsFlipped(false);
      } else {
        Alert.alert('Session Complete', 'You have finished reviewing the deck!');
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Header Container with top safe area padding */}
      <View style={{ backgroundColor: WHITE, paddingTop: insets.top || 15 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={NAVY} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">Vocabulary</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{doneCount}/{totalWords}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Session Progress */}
        <View style={styles.sessionSection}>
          <Text style={styles.sessionLabel}>Session Progress</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* Flashcard */}
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={flipCard}
          activeOpacity={0.95}
        >
          {/* Front Face */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
            ]}
          >
            <Text style={styles.wordText}>{currentWord.word}</Text>
            <Text style={styles.phoneticText}>{currentWord.phonetic}</Text>
            <View style={styles.tapRow}>
              <Ionicons name="refresh-outline" size={14} color={TEXT_GRAY} />
              <Text style={styles.tapText}> tap to flip</Text>
            </View>
          </Animated.View>

          {/* Back Face */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { transform: [{ rotateY: backInterpolate }] },
            ]}
          >
            <Text style={styles.defLabel}>Definition</Text>
            <Text style={styles.defText}>{currentWord.definition}</Text>
            <View style={styles.tapRow}>
              <Ionicons name="refresh-outline" size={14} color={TEXT_GRAY} />
              <Text style={styles.tapText}> tap to flip back</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => goNext('review')}
            activeOpacity={0.85}
          >
            <Ionicons name="time-outline" size={18} color={TEXT_DARK} style={{ marginRight: 6 }} />
            <Text style={styles.reviewBtnText}>Review Later</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.masteredBtn}
            onPress={() => goNext('mastered')}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={WHITE} style={{ marginRight: 6 }} />
            <Text style={styles.masteredBtnText}>Mastered</Text>
          </TouchableOpacity>
        </View>

        {/* Pro Tip */}
        <View style={styles.proTipCard}>
          <View style={styles.proTipHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={18} color={NAVY} />
            <Text style={styles.proTipTitle}>Pro Tip</Text>
          </View>
          <Text style={styles.proTipText}>{currentWord.tip}</Text>
        </View>

        {/* Word Dots Navigation */}
        <View style={styles.dotsRow}>
          {VOCAB_WORDS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
                i < doneCount && styles.dotDone,
              ]}
            />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    height: 64,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: NAVY,
    textAlign: 'center',
  },
  progressBadge: {
    backgroundColor: LIGHT_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7E3FF',
  },
  progressBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: NAVY,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },

  // Session Progress
  sessionSection: {
    marginBottom: 28,
  },
  sessionLabel: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: TEXT_GRAY,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  progressBarBg: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: NAVY,
    borderRadius: 4,
  },

  // Flashcard
  cardContainer: {
    width: '100%',
    height: 240,
    marginBottom: 24,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: WHITE,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: WHITE,
  },
  cardBack: {
    backgroundColor: LIGHT_BLUE,
  },
  wordText: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 10,
  },
  phoneticText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 20,
  },
  tapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tapText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  defLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: NAVY,
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  defText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: TEXT_DARK,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    height: 54,
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
  },
  masteredBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY,
    borderRadius: 16,
    height: 54,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  masteredBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: WHITE,
  },

  // Pro Tip
  proTipCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  proTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  proTipTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: NAVY,
  },
  proTipText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 20,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER_COLOR,
  },
  dotActive: {
    backgroundColor: NAVY,
    width: 20,
  },
  dotDone: {
    backgroundColor: '#10B981',
  },
});
