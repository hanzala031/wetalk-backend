import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLessonWithFallback } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const LIGHT_BLUE = '#EBF2FF';
const TEXT_DARK = '#1F2937';
const TEXT_GRAY = '#6B7280';
const BORDER_COLOR = '#E2E8F0';
const PROGRESS_BG = '#F1F5FE';

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { userName, userAvatar, syncProgressToBackend, userToken } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0); 
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([null, null, null, null, null]);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const activeId = lessonId || '1';
    getLessonWithFallback(activeId, userToken).then((currentLesson) => {
      if (currentLesson && currentLesson.steps && currentLesson.steps.quiz) {
        const formattedQuiz = currentLesson.steps.quiz.map((q: any) => ({
          id: q.qId,
          question: q.question,
          options: q.options.map((opt: string, idx: number) => ({
            id: String.fromCharCode(97 + idx), // a, b, c...
            text: opt
          })),
          correctAnswer: String.fromCharCode(97 + q.correctOptionIndex)
        }));
        setQuizData(formattedQuiz);
        setSelectedAnswers(new Array(formattedQuiz.length).fill(null));
      }
      setLoading(false);
    });
  }, [lessonId, userToken]);

  const handleOptionSelect = (optionId: string) => {
    const newAnswers = [...selectedAnswers];
    const prevAnswer = newAnswers[currentStep];
    newAnswers[currentStep] = optionId;
    setSelectedAnswers(newAnswers);

    // Update score logic
    let newScore = score;
    const isCorrect = optionId === quizData[currentStep].correctAnswer;
    const wasCorrect = prevAnswer === quizData[currentStep].correctAnswer;

    if (isCorrect && !wasCorrect) {
      newScore += 20;
    } else if (!isCorrect && wasCorrect) {
      newScore -= 20;
    }
    setScore(newScore);
  };

  const handleNext = () => {
    if (currentStep < quizData.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(`completed_quiz_${lessonId}`, 'true');
      await syncProgressToBackend();
    } catch (e) {
      console.error('Error saving quiz completion:', e);
    }
    router.push({ pathname: '/lesson-details', params: { id: lessonId } });
  };

  if (loading || quizData.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
      </View>
    );
  }

  const isLastQuestion = currentStep === quizData.length - 1;
  const showResults = currentStep === quizData.length;
  const currentQuestion = quizData[currentStep] || quizData[0];
  const progress = ((currentStep + 1) / quizData.length) * 100;

  if (showResults) {
    const correctCount = selectedAnswers.filter((ans, idx) => ans === quizData[idx].correctAnswer).length;
    
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setCurrentStep(4)} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quiz Result</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.resultsContent}>
            <View style={styles.resultIllustrationContainer}>
               <Image 
                  source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779514394/233ff055-2124-4b15-96da-4466f87c8781_removalai_preview_jfxbjl.png' }}
                  style={styles.illustration}
                  resizeMode="contain"
               />
            </View>

            <Text style={styles.resultTitle}>Congratulations!</Text>
            <Text style={styles.resultSubtitle}>You have completed the quiz.</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Correct Answers</Text>
                <Text style={styles.statValue}>{correctCount} / 5</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Score</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
              <Text style={styles.finishBtnText}>Finish</Text>
              <Ionicons name={"checkmark-done" as any} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
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
          
          {/* Progress Section */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressText}>Question {currentStep + 1} of 5</Text>
              <Text style={styles.percentageText}>{Math.min(progress, 100)}% Complete</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          </View>

          {/* Question Section */}
          <View style={styles.questionSection}>
            <View style={styles.speakerBtn}>
              <Ionicons name="volume-high" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.questionText}>
              {currentQuestion.question}
            </Text>
          </View>

          <Text style={styles.subInstruction}>Choose the correct answer.</Text>

          {/* Options Section */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option: any) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedAnswers[currentStep] === option.id && styles.optionCardSelected
                ]}
                onPress={() => handleOptionSelect(option.id)}
              >
                <View style={[
                  styles.optionLetterCircle,
                  selectedAnswers[currentStep] === option.id && styles.optionLetterCircleSelected
                ]}>
                  <Text style={[
                    styles.optionLetter,
                    selectedAnswers[currentStep] === option.id && styles.optionLetterSelected
                  ]}>
                    {option.id}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
                {selectedAnswers[currentStep] === option.id && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark-circle" size={24} color={PRIMARY_BLUE} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navButtons}>
            <TouchableOpacity 
              style={[styles.prevBtn, currentStep === 0 && { opacity: 0.5 }]} 
              onPress={handlePrevious}
              disabled={currentStep === 0}
            >
              <Ionicons name="chevron-back" size={20} color={PRIMARY_BLUE} />
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.nextBtn, !selectedAnswers[currentStep] && { opacity: 0.5 }]} 
              onPress={handleNext}
              disabled={!selectedAnswers[currentStep]}
            >
              <Text style={styles.nextBtnText}>{isLastQuestion ? 'Submit' : 'Next'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Footer Card */}
          <View style={styles.footerCard}>
            <View style={styles.footerIconWrapper}>
               <Ionicons name={"radio-outline" as any} size={24} color={PRIMARY_BLUE} />
            </View>
            <View style={styles.footerTextContainer}>
              <Text style={styles.footerTitle}>Keep Going!</Text>
              <Text style={styles.footerSubtitle}>You are doing Great.</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Ionicons name="trophy-outline" size={16} color={PRIMARY_BLUE} />
              <Text style={styles.scoreText}>Score {score}</Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
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
    paddingHorizontal: 16,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  percentageText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: PROGRESS_BG,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 4,
  },
  questionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  speakerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    lineHeight: 28,
  },
  subInstruction: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: PRIMARY_BLUE,
    backgroundColor: '#F8FAFF',
  },
  optionLetterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PROGRESS_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionLetterCircleSelected: {
    backgroundColor: PRIMARY_BLUE,
  },
  optionLetter: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  optionLetterSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  checkCircle: {
    marginLeft: 8,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PRIMARY_BLUE,
    width: '46%',
  },
  prevBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginLeft: 8,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: PRIMARY_BLUE,
    width: '46%',
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 20,
  },
  footerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PROGRESS_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  footerTextContainer: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  footerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROGRESS_BG,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginLeft: 4,
  },
  resultsContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  resultIllustrationContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  illustration: {
    width: width * 0.7,
    height: '100%',
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 60,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  finishBtn: {
    backgroundColor: PRIMARY_BLUE,
    height: 56,
    width: '100%',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishBtnText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  bottomSpacer: {
    height: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
