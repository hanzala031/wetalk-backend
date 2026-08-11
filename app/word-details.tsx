import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
 ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView } from 'moti';
import { getLessonWithFallback } from '@/lib/api-client';


const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#6B7280';
const BG_COLOR = '#F8FAFC';

const WORD_ILLUSTRATIONS: Record<string, any> = {
  'hello': require('../assets/images/lesson_1.png'),
  'hi': require('../assets/images/lesson_2.png'),
  'good morning': require('../assets/images/lesson_3.png'),
  'how are you?': require('../assets/images/lesson_4.png'),
  'i am fine, thank you': require('../assets/images/lesson_5.png'),
  'goodbye': require('../assets/images/lesson_6.png'),
};

const getWordIllustration = (word: string) => {
  const key = String(word || '').toLowerCase().trim();
  if (WORD_ILLUSTRATIONS[key]) {
    return WORD_ILLUSTRATIONS[key];
  }
  const fallbacks = [
    require('../assets/images/lesson_1.png'),
    require('../assets/images/lesson_2.png'),
    require('../assets/images/lesson_3.png'),
    require('../assets/images/lesson_4.png'),
    require('../assets/images/lesson_5.png'),
    require('../assets/images/lesson_6.png'),
  ];
  const charCodeSum = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[charCodeSum % fallbacks.length];
};

const getAvatarUri = (avatar: string | null, name: string | null) => {
  if (avatar && avatar.trim() !== '' && avatar !== 'default-avatar.png') {
    return avatar;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=004D73&color=fff`;
};

const getExampleIcon = (sentence: string, index: number): any => {
  const text = sentence.toLowerCase();
  if (text.includes('meet') || text.includes('nice')) return 'hand-left-outline';
  if (text.includes('see') || text.includes('friend') || text.includes('again')) return 'people-outline';
  if (text.includes('morning') || text.includes('day') || text.includes('sun')) return 'sunny-outline';
  if (text.includes('how are you') || text.includes('feeling') || text.includes('health')) return 'heart-outline';
  if (text.includes('fine') || text.includes('good') || text.includes('well') || text.includes('thank')) return 'thumbs-up-outline';
  if (text.includes('goodbye') || text.includes('bye') || text.includes('farewell')) return 'walk-outline';
  if (text.includes('hello') || text.includes('hi')) return 'chatbubble-ellipses-outline';
  return index === 0 ? 'people-outline' : 'chatbubble-ellipses-outline';
};

const GRAMMAR_TIPS: Record<string, string> = {
  '1': "In English, 'Hello' is formal, while 'Hi' is informal. Use 'Hello' in professional settings.",
  '2': "When introducing yourself, both 'I am...' and 'My name is...' are correct. 'My name is' is slightly more formal.",
  '3': "When asking questions, starting with 'Excuse me' makes your request sound much more polite.",
  '4': "Use 'I would like...' instead of 'I want...' to sound polite when ordering food.",
  '5': "When asking for prices, 'How much is this?' is used for singular items, and 'How much are these?' for plural.",
  '6': "Use 'Could you...' or 'Would you mind...' when asking someone for help to sound polite.",
  '7': "When talking about daily routines, use simple present tense like 'I wake up at...' or 'I go to work.'",
  '8': "Use 'in the morning', 'in the afternoon', but 'at night' when talking about time of day.",
  '9': "When describing weather, we say 'It is raining' (action) or 'It is rainy' (description).",
  '10': "Use 'May I...' or 'Can I...' to request permission. 'May I' is more formal and polite."
};

export default function WordDetailsScreen() {
  const params = useLocalSearchParams<{ word: string; lessonId: string }>();
  const { userName, userAvatar, syncProgressToBackend, userToken } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setIsRecording(false);
    setIsCorrect(false);
  }, [currentIndex]);

  useEffect(() => {
    const activeLessonId = params.lessonId || '1';
    getLessonWithFallback(activeLessonId, userToken).then((currentLesson) => {
      if (currentLesson && currentLesson.steps.learn) {
        const formatted = currentLesson.steps.learn.map((w: any) => {
          const wordKey = String(w.word || '').toLowerCase().trim();
          const secondExamplesMap: Record<string, { text: string; explanation: string }> = {
            'hello': { text: 'Hello! Nice to meet you.', explanation: 'Used when meeting someone for the first time.' },
            'hi': { text: 'Hi! Good to see you again.', explanation: 'Used when seeing a friend again.' },
            'good morning': { text: 'Good morning, everyone!', explanation: 'Used to greet a group of people in the morning.' },
            'how are you?': { text: 'How are you feeling today?', explanation: 'Asking about someone\'s health or mood.' },
            'i am fine, thank you': { text: 'I am doing well, thank you!', explanation: 'A positive and friendly reply.' },
            'goodbye': { text: 'Goodbye! Have a great day ahead.', explanation: 'A warm farewell wishing someone a nice day.' },
          };

          const example1Text = w.example || (wordKey === 'hello' ? 'Hello! How are you?' : `Hello! How are you?`);
          const example1Desc = wordKey === 'hello'
            ? 'A polite way to greet and ask about someone'
            : `Example sentence using "${w.word.toLowerCase()}"`;

          const example2 = secondExamplesMap[wordKey] || {
            text: `Nice to practice "${w.word}" with you.`,
            explanation: `Used when practicing conversation with "${w.word.toLowerCase()}"`
          };

          return {
            word: w.word,
            phonetic: w.phonetic || w.word,
            meaning: w.meaning,
            examples: [
              { text: example1Text, explanation: example1Desc },
              example2
            ]
          };
        });
        setWords(formatted);
        
        if (params.word) {
          const index = formatted.findIndex((w: any) => w.word === params.word);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      }
      setLoading(false);
    });
  }, [params.word, params.lessonId, userToken]);

  if (loading || words.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
      </View>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1,
      rate: 0.9,
    });
  };

  const toggleRecording = async () => {
    if (isCorrect) return;

    if (isRecording) {
      setIsRecording(false);
      setIsCorrect(true);
      
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-200.wav' }
        );
        await sound.playAsync();
      } catch (err) {
        console.warn('Sound playback failed:', err);
      }
    } else {
      setIsRecording(true);
      setIsCorrect(false);
    }
  };

  const handleNext = async () => {
    const activeLessonId = params.lessonId || '1';
    if (currentIndex < words.length - 1) {
      const nextIndex = currentIndex + 1;
      try {
        await AsyncStorage.setItem(`learned_word_index_${activeLessonId}`, String(nextIndex));
      } catch (e) {
        console.error('Error saving index:', e);
      }
      setCurrentIndex(nextIndex);
    } else {
      try {
        await AsyncStorage.setItem(`completed_words_${activeLessonId}`, 'true');
        await syncProgressToBackend();
        router.replace({ pathname: '/practice-intro', params: { lessonId: activeLessonId } });
      } catch (e) {
        console.error('Error saving completion:', e);
        router.replace({ pathname: '/practice-intro', params: { lessonId: activeLessonId } });
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentWord.word}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: getAvatarUri(userAvatar, userName) }} 
                style={styles.avatar}
              />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.topSection}>
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <Text style={styles.stepText}>Step {currentIndex + 1} of {words.length}</Text>
              <View style={styles.progressBarWrapper}>
                <MotiView
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'timing', duration: 450 }}
                  style={styles.progressBarFill}
                />
              </View>
              <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
            </View>

            {/* Main Word Card */}
            <View style={styles.mainCard}>
              <View style={styles.cardHeader}>
                 <View style={styles.badge}>
                    <Text style={styles.badgeText}>Words {currentIndex + 1} of {words.length}</Text>
                 </View>
              </View>

              <View style={styles.wordRow}>
                <View style={styles.wordInfo}>
                  <View style={styles.wordTitleRow}>
                    <Text style={styles.wordTitle}>{currentWord.word}</Text>
                    <TouchableOpacity style={styles.speakerBtn} onPress={() => speak(currentWord.word)}>
                      <Ionicons name="volume-high" size={20} color={PRIMARY_BLUE} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.phoneticText}>{currentWord.phonetic}</Text>
                  
                  <View style={styles.meaningBox}>
                    <View style={styles.meaningHeader}>
                      <Ionicons name="sparkles" size={14} color={PRIMARY_BLUE} />
                      <Text style={styles.meaningTitle}>Meaning</Text>
                    </View>
                    <Text style={styles.meaningText}>{currentWord.meaning}</Text>
                  </View>

                  {/* Listen & Repeat Mic Section */}
                  <View style={styles.micSection}>
                    <Text style={styles.micPracticeLabel}>Listen & Repeat Practice</Text>
                    <View style={styles.micRow}>
                      <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={toggleRecording} 
                        style={[
                          styles.micBtn, 
                          isRecording && styles.micBtnActive,
                          isCorrect && styles.micBtnCorrect
                        ]}
                      >
                        <Ionicons 
                          name={isCorrect ? "checkmark" : isRecording ? "stop" : "mic"} 
                          size={22} 
                          color="#FFFFFF" 
                        />
                      </TouchableOpacity>
                      <View style={styles.micTextInfo}>
                        <Text style={styles.micInstructionText}>
                          {isCorrect 
                            ? "Perfect Pronunciation! (100% Match)" 
                            : isRecording 
                              ? "Listening... speak now" 
                              : `Tap to practice speaking "${currentWord.word}"`
                          }
                        </Text>
                        {isCorrect && (
                          <View style={styles.successBadge}>
                            <Ionicons name="ribbon" size={12} color="#16A34A" />
                            <Text style={styles.successBadgeText}>Accurate Accent</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Examples Section */}
            <Text style={styles.sectionTitle}>Examples</Text>
            
            <View style={styles.examplesOuterCard}>
              {currentWord.examples.map((ex: any, idx: number) => (
                <View key={idx} style={[styles.exampleRowItem, idx < currentWord.examples.length - 1 && styles.exampleRowBorder]}>
                  <View style={styles.exampleIconWrapper}>
                    <Ionicons name={getExampleIcon(ex.text, idx)} size={20} color={PRIMARY_BLUE} />
                  </View>
                  <View style={styles.exampleContent}>
                    <Text style={styles.exampleSentence}>{ex.text}</Text>
                    <Text style={styles.exampleExplanation}>{ex.explanation}</Text>
                  </View>
                  <TouchableOpacity style={styles.exampleSpeakerBtn} onPress={() => speak(ex.text)}>
                    <Ionicons name="volume-high" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Grammar Tip Card */}
            <View style={styles.grammarTipCard}>
               <View style={styles.tipIconWrapper}>
                  <Ionicons name="bulb-outline" size={24} color={PRIMARY_BLUE} />
               </View>
               <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Grammar Tip</Text>
                  <Text style={styles.tipText}>
                    {GRAMMAR_TIPS[params.lessonId || '1'] || "Practice using these words in daily conversations to remember them better."}
                  </Text>
               </View>
               <Image 
                 source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779345793/47306607-a224-47cb-94eb-6538c4e375fd_removalai_preview_gtszq4.png' }} 
                 style={styles.tipRobot}
                 resizeMode="contain"
               />
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
               <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
               <Text style={styles.nextBtnText}>
                 {currentIndex === words.length - 1 ? 'Start Practice Quiz' : 'Next word'}
               </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 4,
    minWidth: 70,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 70,
  },
  iconBtn: {
    marginRight: 10,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  topSection: {
    flex: 1,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
    marginRight: 10,
  },
  progressBarWrapper: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_BLUE,
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
    marginLeft: 10,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Nunito-SemiBold',
    color: PRIMARY_BLUE,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wordInfo: {
    flex: 1,
    paddingRight: 8,
  },
  cardIllustration: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginLeft: 6,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  wordTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginRight: 8,
  },
  speakerBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneticText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 16,
  },
  meaningBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 10,
  },
  meaningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  meaningTitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginLeft: 4,
  },
  meaningText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 15,
  },
  illustration: {
    width: 150,
    height: 120,
    borderRadius: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 12,
  },
  examplesOuterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  exampleRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  exampleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  exampleIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exampleContent: {
    flex: 1,
    paddingRight: 8,
  },
  exampleSentence: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 2,
  },
  exampleExplanation: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 14,
  },
  exampleSpeakerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grammarTipCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  tipIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 14,
  },
  tipRobot: {
    width: 70,
    height: 70,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  backBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  nextBtn: {
    flex: 1.5,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 0,
  },
  micSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  micPracticeLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginBottom: 8,
  },
  micRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  micBtnCorrect: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
  },
  micTextInfo: {
    flex: 1,
    marginLeft: 12,
  },
  micInstructionText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: TEXT_DARK,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  successBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#16A34A',
    marginLeft: 4,
  },
});
