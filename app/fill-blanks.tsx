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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import * as Speech from 'expo-speech';
import { MotiView, AnimatePresence } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLessonWithFallback } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#1F2937';
const TEXT_GRAY = '#6B7280';
const SUCCESS_GREEN = '#2E7D32';
const ERROR_RED = '#DC2626';

type QuestionStatus = 'pending' | 'correct' | 'wrong';

interface Question {
  id: number;
  prefix: string;
  suffix: string;
  correctAnswer: string;
  userAnswer: string;
  status: QuestionStatus;
}

const INITIAL_QUESTIONS: Question[] = [
  { id: 1, prefix: "Practice every day helps you", suffix: "your skills.", correctAnswer: "improve", userAnswer: "", status: 'pending' },
  { id: 2, prefix: "Every mistake is an", suffix: "to learn something new.", correctAnswer: "opportunity", userAnswer: "", status: 'pending' },
  { id: 3, prefix: "When you practice speaking you feel more", suffix: "and ready to talk.", correctAnswer: "confident", userAnswer: "", status: 'pending' },
  { id: 4, prefix: "Learning English opens new", suffix: "for your career.", correctAnswer: "doors", userAnswer: "", status: 'pending' },
  { id: 5, prefix: "Don't be afraid to", suffix: "your mistakes.", correctAnswer: "correct", userAnswer: "", status: 'pending' },
];

export default function FillInTheBlanksScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { userName, userAvatar, syncProgressToBackend, userToken } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAllCorrect, setIsAllCorrect] = useState(false);

  useEffect(() => {
    const activeId = lessonId || '1';
    getLessonWithFallback(activeId, userToken).then((currentLesson) => {
      if (currentLesson) {
        const dynamicQs: Question[] = [];
        let qIndex = 1;
        
        // 1. Get fill_blanks question from practice steps if exists
        if (currentLesson.steps.practice) {
          const practiceBlank = currentLesson.steps.practice.find((p: any) => p.type === 'fill_blanks');
          if (practiceBlank && practiceBlank.sentence && practiceBlank.correctAnswer) {
            const parts = practiceBlank.sentence.split(/_______+/);
            const prefix = parts[0] || '';
            const suffix = parts[1] || '';
            dynamicQs.push({
              id: qIndex++,
              prefix: prefix.trim(),
              suffix: suffix.trim(),
              correctAnswer: practiceBlank.correctAnswer.trim(),
              userAnswer: '',
              status: 'pending' as const
            });
          }
        }
        
        // 2. Generate questions from first 4 words in vocabulary steps.learn
        if (currentLesson.steps.learn) {
          const vocabWords = currentLesson.steps.learn.slice(0, 4);
          vocabWords.forEach((item: any) => {
            const word = item.word;
            const sentence = item.example;
            if (word && sentence) {
              const index = sentence.toLowerCase().indexOf(word.toLowerCase());
              if (index !== -1) {
                const prefix = sentence.substring(0, index);
                const suffix = sentence.substring(index + word.length);
                dynamicQs.push({
                  id: qIndex++,
                  prefix: prefix,
                  suffix: suffix,
                  correctAnswer: word,
                  userAnswer: '',
                  status: 'pending' as const
                });
              }
            }
          });
        }
        
        if (dynamicQs.length > 0) {
          setQuestions(dynamicQs);
        } else {
          setQuestions(INITIAL_QUESTIONS);
        }
      }
    });
  }, [lessonId, userToken]);

  useEffect(() => {
    const allDone = questions.length > 0 && questions.every(q => q.status === 'correct');
    setIsAllCorrect(allDone);
  }, [questions]);

  const speakSentence = (question: Question) => {
    const fullText = `${question.prefix} ${question.correctAnswer} ${question.suffix}`;
    Speech.speak(fullText, { language: 'en', rate: 0.9 });
  };

  const handleCheckAnswer = (id: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const isMatch = q.userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        if (isMatch) {
           Speech.speak("Correct!", { rate: 1.1 });
           return { ...q, status: 'correct' as const };
        } else {
           Speech.speak("Try again", { rate: 1.1 });
           return { ...q, status: 'wrong' as const };
        }
      }
      return q;
    }));
  };

  const handleInputChange = (id: number, text: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, userAnswer: text, status: 'pending' as const } : q
    ));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Fill in the blanks</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={24} color={PRIMARY_BLUE} />
              </TouchableOpacity>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: (userAvatar && userAvatar !== 'default-avatar.png') ? userAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=004D73&color=fff` }} 
                  style={styles.avatar}
                />
              </View>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Hero Section */}
            <View style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View style={styles.practiceBadge}>
                  <Ionicons name="pencil" size={12} color={PRIMARY_BLUE} />
                  <Text style={styles.practiceBadgeText}>Practice Time</Text>
                </View>
                <Text style={styles.heroTitle}>Great Practice{"\n"}Makes Perfect!</Text>
                <Text style={styles.heroSubtitle}>Complete the sentences with the correct words.</Text>
              </View>
              <Image 
                source={require('../assets/images/fill_blanks_hero.png')} 
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>

            {/* Questions Section */}
            <View style={styles.questionsCard}>
               <View style={styles.questionsHeader}>
                  <Ionicons name="star" size={20} color={PRIMARY_BLUE} />
                  <Text style={styles.questionsTitle}>Complete the sentences</Text>
               </View>

               <View style={styles.sentenceList}>
                  {questions.map((q) => (
                    <View key={q.id} style={styles.sentenceItem}>
                      <MotiView 
                        animate={{ 
                          backgroundColor: q.status === 'correct' ? SUCCESS_GREEN : q.status === 'wrong' ? ERROR_RED : '#EBF2FF' 
                        }}
                        style={styles.statusCircle}
                      >
                        <AnimatePresence exitBeforeEnter>
                          {q.status === 'correct' ? (
                            <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} key="tick">
                               <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            </MotiView>
                          ) : q.status === 'wrong' ? (
                            <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} key="cross">
                               <Ionicons name="close" size={16} color="#FFFFFF" />
                            </MotiView>
                          ) : (
                            <Text style={styles.numberText} key="num">{q.id}</Text>
                          )}
                        </AnimatePresence>
                      </MotiView>

                      <View style={styles.sentenceWrapper}>
                        <Text style={styles.sentenceText}>
                          {q.prefix}{' '}
                          <TextInput
                            style={[
                              styles.blankInput,
                              q.status === 'correct' && styles.inputCorrect,
                              q.status === 'wrong' && styles.inputWrong,
                            ]}
                            value={q.userAnswer}
                            onChangeText={(text) => handleInputChange(q.id, text)}
                            onSubmitEditing={() => handleCheckAnswer(q.id)}
                            placeholder="________"
                            placeholderTextColor="#CBD5E1"
                            editable={q.status !== 'correct'}
                            autoCapitalize="none"
                          />
                          {' '}{q.suffix}
                        </Text>
                        
                        <View style={styles.actionRow}>
                          {q.status === 'wrong' && (
                            <TouchableOpacity onPress={() => handleInputChange(q.id, '')}>
                              <Text style={styles.tryAgainText}>Try Again</Text>
                            </TouchableOpacity>
                          )}
                          {q.status === 'correct' && (
                             <TouchableOpacity onPress={() => speakSentence(q)} style={styles.speakBtn}>
                                <Ionicons name="volume-high" size={14} color={SUCCESS_GREEN} />
                                <Text style={styles.speakText}>Listen</Text>
                             </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
               </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Bottom Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.nextBtn, !isAllCorrect && styles.nextBtnDisabled]} 
             onPress={async () => {
                const activeId = lessonId || '1';
                try {
                  await AsyncStorage.setItem(`completed_fill_blanks_${activeId}`, 'true');
                  await syncProgressToBackend();
                } catch (e) {
                  console.error(e);
                }
                router.back();
              }}
              disabled={!isAllCorrect}
            >
              <MotiView 
                animate={{ opacity: isAllCorrect ? 1 : 0.6 }}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={styles.nextBtnText}>
                  {isAllCorrect ? "Continue to Next" : "Complete all to Continue"}
                </Text>
                {isAllCorrect && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />}
              </MotiView>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroCard: {
    backgroundColor: '#EBF2FF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 160,
  },
  heroContent: {
    flex: 1,
    paddingRight: 100,
  },
  practiceBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  practiceBadgeText: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 16,
  },
  heroImage: {
    width: 120,
    height: 140,
    position: 'absolute',
    right: 5,
    bottom: 0,
  },
  questionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  questionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  questionsTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginLeft: 8,
  },
  sentenceList: {
    gap: 24,
  },
  sentenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  numberText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  sentenceWrapper: {
    flex: 1,
  },
  sentenceText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    lineHeight: 24,
  },
  blankInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    minWidth: 90,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: PRIMARY_BLUE,
    padding: 0,
    marginHorizontal: 4,
  },
  inputCorrect: {
    borderBottomColor: SUCCESS_GREEN,
    color: SUCCESS_GREEN,
  },
  inputWrong: {
    borderBottomColor: ERROR_RED,
    color: ERROR_RED,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tryAgainText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: ERROR_RED,
  },
  speakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: SUCCESS_GREEN,
    marginLeft: 4,
  },
  bottomSpacer: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  nextBtn: {
    backgroundColor: PRIMARY_BLUE,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
});
