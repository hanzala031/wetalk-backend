import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { getLessonWithFallback } from '@/lib/api-client';

const LESSON_IMAGES: Record<number, any> = {
  1: require('../assets/images/lesson_1.png'),
  2: require('../assets/images/lesson_2.png'),
  3: require('../assets/images/lesson_3.png'),
  4: require('../assets/images/lesson_4.png'),
  5: require('../assets/images/lesson_5.png'),
  6: require('../assets/images/lesson_6.png'),
  7: require('../assets/images/lesson_7.png'),
  8: require('../assets/images/lesson_8.png'),
  9: require('../assets/images/lesson_9.png'),
  10: require('../assets/images/lesson_10.png'),
  11: require('../assets/images/lesson_11.png'),
  12: require('../assets/images/lesson_12.png'),
  13: require('../assets/images/lesson_13.png'),
  14: require('../assets/images/lesson_14.png'),
  15: require('../assets/images/lesson_15.png')
};

const getLessonImage = (lessonNumber: number) => {
  return LESSON_IMAGES[lessonNumber] || { uri: 'https://img.freepik.com/free-vector/teaching-concept-illustration_114360-1708.jpg' };
};

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73'; // Adjusted to match the deeper blue in image
const TEXT_DARK = '#1F2937';
const TEXT_GRAY = '#6B7280';
const BG_COLOR = '#F8FAFC';
const COMPLETED_GREEN = '#4CAF50';
const LIGHT_BLUE = '#E8EFFF';

export default function LessonDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userName, userAvatar, userToken } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isWordsCompleted, setIsWordsCompleted] = useState(false);
  const [isPracticeCompleted, setIsPracticeCompleted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isReviewCompleted, setIsReviewCompleted] = useState(false);

  useEffect(() => {
    loadLessonData();
  }, [id, userToken]);

  const checkCompletion = async () => {
    try {
      const activeId = id || '1';
      const words = await AsyncStorage.getItem(`completed_words_${activeId}`);
      const practice = await AsyncStorage.getItem(`completed_practice_${activeId}`);
      const quiz = await AsyncStorage.getItem(`completed_quiz_${activeId}`);
      const review = await AsyncStorage.getItem(`completed_review_${activeId}`);
      const finished = await AsyncStorage.getItem(`lesson_finished_${activeId}`);
      
      if (words === 'true') setIsWordsCompleted(true);
      if (practice === 'true') setIsPracticeCompleted(true);
      if (quiz === 'true') setIsQuizCompleted(true);
      if (review === 'true' || finished === 'true') setIsReviewCompleted(true);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLessonData = async () => {
    try {
      const activeId = id || '1';
      const foundLesson = await getLessonWithFallback(activeId, userToken);
      
      if (foundLesson) {
        const titleStr = foundLesson.title || foundLesson.displayTitle || `Lesson ${foundLesson.lessonNumber || foundLesson.lessonId || activeId || '1'}`;
        const descStr = foundLesson.description || foundLesson.displayDesc || '';
        const processedLesson = {
          ...foundLesson,
          lessonNumber: foundLesson.lessonNumber || foundLesson.lessonId || Number(activeId) || 1,
          displayTitle: titleStr,
          displayDesc: descStr,
          progress: 0,
        };
        setLesson(processedLesson);

        const words = await AsyncStorage.getItem(`completed_words_${activeId}`);
        const practice = await AsyncStorage.getItem(`completed_practice_${activeId}`);
        const quiz = await AsyncStorage.getItem(`completed_quiz_${activeId}`);
        const review = await AsyncStorage.getItem(`completed_review_${activeId}`);
        const finished = await AsyncStorage.getItem(`lesson_finished_${activeId}`);

        const wordsDone = !!(foundLesson.userSteps?.learn || words === 'true');
        const practiceDone = !!(foundLesson.userSteps?.practice || practice === 'true');
        const quizDone = !!(foundLesson.userSteps?.quiz || quiz === 'true');
        const reviewDone = !!(foundLesson.userSteps?.review || review === 'true' || finished === 'true');

        setIsWordsCompleted(wordsDone);
        setIsPracticeCompleted(practiceDone);
        setIsQuizCompleted(quizDone);
        setIsReviewCompleted(reviewDone);
      }
    } catch (error) {
      console.error('Error loading lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add listener to refresh completion status when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      checkCompletion();
    }, [id, userToken])
  );

  if (loading || !lesson) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
      </View>
    );
  }

  const progressSteps = [
    { label: '1.Learn', icon: 'book-outline' },
    { label: '2.Practice', icon: 'search-outline' },
    { label: '3.Quiz', icon: 'help-circle-outline' },
    { label: '4.Review', icon: 'star-outline' },
  ];

  const lessonTitleText = (lesson?.displayTitle || lesson?.title || 'this lesson').toLowerCase();

  const contentItems = [
    { id: 1, title: '1. Learn New Words', subtitle: `Learn vocabulary and key phrases for ${lessonTitleText}.`, status: isWordsCompleted ? 'Completed' : 'Start' },
    { id: 2, title: '2. Practice', subtitle: `Practice ${lessonTitleText} in real conversations.`, status: isPracticeCompleted ? 'Completed' : (isWordsCompleted ? 'Start' : 'Locked') },
    { id: 3, title: '3. Quiz', subtitle: 'Test your knowledge with a quick quiz.', status: isQuizCompleted ? 'Completed' : (isPracticeCompleted ? 'Start' : 'Locked') },
    { id: 4, title: '4. Review', subtitle: 'Review what you learned in this lesson.', status: isReviewCompleted ? 'Completed' : (isQuizCompleted ? 'Start' : 'Locked') },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lesson {lesson.lessonNumber}</Text>
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

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          onScrollBeginDrag={() => checkCompletion()} // Refresh completion when user interacts
        >
          
          {/* Top Lesson Card */}
          <View style={styles.topLessonCard}>
            <Image 
              source={getLessonImage(lesson.lessonNumber)} 
              style={styles.lessonIllustration}
              contentFit="contain"
            />
            <View style={styles.lessonInfo}>
              <View style={styles.lessonBadge}>
                <Text style={styles.lessonBadgeText}>Lesson {lesson.lessonNumber}</Text>
              </View>
              <Text style={styles.lessonTitle}>{lesson.displayTitle}</Text>
              <Text style={styles.lessonDescription}>{lesson.displayDesc}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(isWordsCompleted ? 25 : 0) + (isPracticeCompleted ? 25 : 0) + (isQuizCompleted ? 25 : 0) + (isReviewCompleted ? 25 : 0)}%` }]} />
                </View>
                <Text style={styles.progressText}>{(isWordsCompleted ? 25 : 0) + (isPracticeCompleted ? 25 : 0) + (isQuizCompleted ? 25 : 0) + (isReviewCompleted ? 25 : 0)}% Completed</Text>
              </View>
            </View>
          </View>

          {/* Lesson Progress Stepper */}
          <Text style={styles.sectionTitle}>Lesson Progress</Text>
          <View style={styles.progressStepperCard}>
            <View style={styles.stepperTrack} />
            <View style={styles.stepperRow}>
              {progressSteps.map((step, index) => {
                let isStepCompleted = false;
                if (index === 0 && isWordsCompleted) isStepCompleted = true;
                if (index === 1 && isPracticeCompleted) isStepCompleted = true;
                if (index === 2 && isQuizCompleted) isStepCompleted = true;
                if (index === 3 && isReviewCompleted) isStepCompleted = true;
                
                return (
                  <View key={index} style={styles.stepItem}>
                    <View style={[
                      styles.stepCircle, 
                      { 
                        backgroundColor: isStepCompleted ? PRIMARY_BLUE : '#FFFFFF', 
                        borderColor: PRIMARY_BLUE 
                      }
                    ]}>
                      <Ionicons 
                        name={step.icon as any} 
                        size={18} 
                        color={isStepCompleted ? '#FFFFFF' : PRIMARY_BLUE} 
                      />
                      {isStepCompleted && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.stepLabel}>{step.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Lesson Content List */}
          <Text style={styles.sectionTitle}>Lesson Content</Text>
          <View style={styles.contentListCard}>
            {contentItems.map((item, index) => {
              const isLocked = item.status === 'Locked';
              const isCompleted = item.status === 'Completed';
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.contentItem, 
                    index === contentItems.length - 1 && { borderBottomWidth: 0 },
                    isLocked && { opacity: 0.6 }
                  ]}
                  disabled={isLocked || isCompleted}
                  onPress={() => {
                    if (index === 0) {
                      router.push({ pathname: '/learn-new-words', params: { lessonId: id } });
                    } else if (index === 1) {
                      router.push({ pathname: '/practice-intro', params: { lessonId: id } });
                    } else if (index === 2) {
                      router.push({ pathname: '/quiz-intro', params: { lessonId: id } });
                    } else if (index === 3) {
                      router.push({ pathname: '/lesson-review', params: { lessonId: id } });
                    } else {
                      router.push('/lesson-player');
                    }
                  }}
                >
                  <View style={styles.contentIconWrapper}>
                    <Ionicons 
                      name={index === 0 ? "book-outline" : index === 1 ? "pencil-outline" : index === 2 ? "help-circle-outline" : "star-outline"} 
                      size={20} 
                      color={isLocked ? "#94A3B8" : PRIMARY_BLUE} 
                    />
                  </View>
                  <View style={styles.contentText}>
                    <Text style={[styles.contentItemTitle, isLocked && { color: "#94A3B8" }]}>{item.title}</Text>
                    <Text style={styles.contentItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View style={styles.contentAction}>
                    {isCompleted ? (
                      <Ionicons name="checkmark-circle" size={24} color="#16A34A" style={{ marginRight: 4 }} />
                    ) : isLocked ? (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                        <Text style={styles.lockedText}>Locked</Text>
                      </View>
                    ) : (
                      <View style={styles.startBtn}>
                        <Text style={styles.startBtnText}>Start</Text>
                      </View>
                    )}
                    {!isCompleted && <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginLeft: 4 }} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* AI Tutor Card */}
          <View style={styles.aiTutorCard}>
            <View style={styles.aiTutorMain}>
              <Image 
                source={require('../assets/images/ai_tutor_help.png')} 
                style={styles.aiRobotImage}
                contentFit="contain"
              />
              <View style={styles.aiTutorContent}>
                <Text style={styles.aiTutorTitle}>Need help understanding this lesson?</Text>
                <Text style={styles.aiTutorSubtitle}>Talk to your AI Tutor for more examples and personalized help.</Text>
              </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 40,
  },
  topLessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  lessonIllustration: {
    width: 110,
    height: 110,
    marginRight: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  lessonBadgeText: {
    fontSize: 11,
    fontFamily: 'Nunito-SemiBold',
    color: PRIMARY_BLUE,
  },
  lessonTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 16,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_BLUE,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 12,
  },
  progressStepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  stepperTrack: {
    position: 'absolute',
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: PRIMARY_BLUE,
    top: 38,
    zIndex: 0,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: (width - 64) / 4,
  },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
    marginBottom: 8,
  },
  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PRIMARY_BLUE,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
  },
  contentListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  contentIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentText: {
    flex: 1,
  },
  contentItemTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
    marginBottom: 2,
  },
  contentItemSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
  },
  contentAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
  },
  lockedBadge: {
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#94A3B8',
  },
  startBtn: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  startBtnText: {
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  aiTutorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  aiTutorMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiRobotImage: {
    width: 65,
    height: 65,
    marginRight: 12,
  },
  aiTutorContent: {
    flex: 1,
  },
  aiTutorTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
    marginBottom: 2,
  },
  aiTutorSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 15,
  },
  chatTutorBtn: {
    backgroundColor: PRIMARY_BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
  },
  chatTutorText: {
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 20,
  },
});


