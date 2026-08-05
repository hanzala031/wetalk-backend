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
import AsyncStorage from '@react-native-async-storage/async-storage';
import lessonsData from '@/data/lessons.json';


const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#6B7280';
const BG_COLOR = '#F8FAFC';

// Removed hardcoded GREETING_WORDS to load them dynamically from lessonsData

export default function WordDetailsScreen() {
  const params = useLocalSearchParams<{ word: string; lessonId: string }>();
  const { userAvatar, syncProgressToBackend } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeLessonId = params.lessonId || '1';
    const allLessons = lessonsData.lessons || [];
    const currentLesson = allLessons.find(l => l.id === activeLessonId);
    
    if (currentLesson && currentLesson.steps.learn) {
      const formatted = currentLesson.steps.learn.map((w: any) => ({
        word: w.word,
        phonetic: w.phonetic || w.word,
        meaning: w.meaning,
        examples: [
          { text: w.example, explanation: `Example sentence using "${w.word.toLowerCase()}"` }
        ]
      }));
      setWords(formatted);
      
      if (params.word) {
        const index = formatted.findIndex(w => w.word === params.word);
        if (index !== -1) {
          setCurrentIndex(index);
        }
      }
    }
    setLoading(false);
  }, [params.word, params.lessonId]);

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
      language: 'en',
      pitch: 1,
      rate: 0.9,
    });
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
        router.replace({ pathname: '/lesson-details', params: { id: activeLessonId } });
      } catch (e) {
        console.error('Error saving completion:', e);
        router.replace({ pathname: '/lesson-details', params: { id: activeLessonId } });
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
                source={{ uri: userAvatar || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }} 
                style={styles.avatar}
              />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.stepText}>Step {currentIndex + 1} of {words.length}</Text>
            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
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
              </View>
            </View>
          </View>

          {/* Examples Section */}
          <Text style={styles.sectionTitle}>Examples</Text>
          
          {currentWord.examples.map((ex: any, idx: number) => (
            <View key={idx} style={styles.exampleCard}>
              <View style={styles.exampleIconWrapper}>
                 <Ionicons name={idx === 0 ? "people" : "chatbubble"} size={20} color={PRIMARY_BLUE} />
              </View>
              <View style={styles.exampleContent}>
                <Text style={styles.exampleSentence}>{ex.text}</Text>
                <Text style={styles.exampleExplanation}>{ex.explanation}</Text>
              </View>
              <TouchableOpacity style={styles.exampleSpeaker} onPress={() => speak(ex.text)}>
                <Ionicons name="volume-high" size={20} color={PRIMARY_BLUE} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Grammar Tip Card */}
          <View style={styles.grammarTipCard}>
             <View style={styles.tipIconWrapper}>
                <Ionicons name="bulb-outline" size={24} color={PRIMARY_BLUE} />
             </View>
             <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Garaamar tip</Text>
                <Text style={styles.tipText}>Trying using this words in daily conversations to remember them better</Text>
             </View>
             <Image 
               source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779345793/47306607-a224-47cb-94eb-6538c4e375fd_removalai_preview_gtszq4.png' }} 
               style={styles.tipRobot}
               resizeMode="contain"
             />
          </View>

          {/* Bottom Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>{currentIndex === words.length - 1 ? 'Finish' : 'Next word'}</Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
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
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
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
    paddingRight: 0,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  wordTitle: {
    fontSize: 28,
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
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  exampleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exampleContent: {
    flex: 1,
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
  },
  exampleSpeaker: {
    padding: 8,
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
});
