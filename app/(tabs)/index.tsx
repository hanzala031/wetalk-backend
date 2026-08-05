import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, authConfig, isNetworkError } from '@/lib/api-client';
import lessonsData from '@/data/lessons.json';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const GRAY_ACCENT = '#CBD5E1';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#6B7280';
const BG_COLOR = '#F8FAFC';

const LESSON_IMAGES: Record<number, any> = {
  1: require('../../assets/images/lesson_1.png'),
  2: require('../../assets/images/lesson_2.png'),
  3: require('../../assets/images/lesson_3.png'),
  4: require('../../assets/images/lesson_4.png'),
  5: require('../../assets/images/lesson_5.png'),
  6: require('../../assets/images/lesson_6.png'),
  7: require('../../assets/images/lesson_7.png'),
  8: require('../../assets/images/lesson_8.png'),
  9: require('../../assets/images/lesson_9.png'),
  10: require('../../assets/images/lesson_10.png'),
  11: require('../../assets/images/lesson_11.png'),
  12: require('../../assets/images/lesson_12.png'),
  13: require('../../assets/images/lesson_13.png'),
  14: require('../../assets/images/lesson_14.png'),
  15: require('../../assets/images/lesson_15.png'),
};

const getLessonImage = (lessonId: number) => {
  return LESSON_IMAGES[lessonId] || { uri: 'https://img.freepik.com/free-vector/teaching-concept-illustration_114360-1708.jpg' };
};

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DashboardScreen() {
  const { userName, userAvatar, userToken } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t, language } = useLanguage();

  const loadData = async () => {
    try {
      // 1. Fetch backend progress if token exists
      let remoteCompleted: number[] = [];
      let currentLessonNum = 1;
      
      if (userToken) {
        try {
          const res = await apiClient.get('/user/sync', authConfig(userToken));
          if (res.data?.success && res.data.progressData) {
            const p = res.data.progressData;
            if (p.completed_lessons) {
              remoteCompleted = typeof p.completed_lessons === 'string' 
                ? JSON.parse(p.completed_lessons) 
                : (Array.isArray(p.completed_lessons) ? p.completed_lessons : []);
            }
          }
          
          // Also try to get current lesson status for lock logic
          const lessonRes = await apiClient.get('/lessons/visible', authConfig(userToken));
          if (Array.isArray(lessonRes.data)) {
             // We can use this to find the current active lesson number
             const activeLesson = lessonRes.data.find(l => l.status === 'active');
             if (activeLesson) currentLessonNum = activeLesson.lessonNumber;
          }
        } catch (err) {
          if (!isNetworkError(err)) {
            console.warn('Backend sync failed:', err);
          }
        }
      }

      // 2. Fetch local progress
      const completedStr = await AsyncStorage.getItem('completed_lessons');
      let localCompleted = completedStr ? JSON.parse(completedStr) : [];
      
      // Merge unique completed IDs
      const mergedCompleted = Array.from(new Set([...localCompleted.map(Number), ...remoteCompleted.map(Number)]));
      
      // Sync merged back to local for offline use
      await AsyncStorage.setItem('completed_lessons', JSON.stringify(mergedCompleted.map(String)));

      const today = getLocalDateString();
      const allLessons = lessonsData.lessons || [];
      const processedLessons = await Promise.all(allLessons.map(async (lesson: any, index: number) => {
        const lessonNum = Number(lesson.id);
        const isWordsCompleted = (await AsyncStorage.getItem(`completed_words_${lesson.id}`)) === 'true';
        const isPracticeCompleted = (await AsyncStorage.getItem(`completed_practice_${lesson.id}`)) === 'true';
        const isQuizCompleted = (await AsyncStorage.getItem(`completed_quiz_${lesson.id}`)) === 'true';
        const isReviewCompleted = (await AsyncStorage.getItem(`completed_review_${lesson.id}`)) === 'true';
        
        const progress = (isWordsCompleted ? 25 : 0) + (isPracticeCompleted ? 25 : 0) + (isQuizCompleted ? 25 : 0) + (isReviewCompleted ? 25 : 0);

        let status = 'locked';
        if (mergedCompleted.includes(lessonNum)) {
          status = 'completed';
        } else if (lessonNum === currentLessonNum) {
          status = 'active';
        } else if (mergedCompleted.includes(Number(allLessons[index-1]?.id))) {
          const prevLessonId = allLessons[index-1]?.id;
          const completionDate = await AsyncStorage.getItem(`completion_date_${prevLessonId}`);
          
          if (!completionDate || completionDate !== today) {
            status = 'active';
          } else {
            status = 'locked';
          }
        }

        return {
          ...lesson,
          displayTitle: lesson.title,
          displayDesc: lesson.description,
          status,
          progress: status === 'completed' ? 100 : progress,
        };
      }));

      setLessons(processedLessons);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [userToken])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getAvatarUrl = () => {
    if (userAvatar && userAvatar.trim() !== '' && userAvatar !== 'default-avatar.png') {
      return { uri: userAvatar };
    }
    return { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=004D73&color=fff` };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{language} Learner</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={getAvatarUrl()} 
                  style={styles.avatar}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
 
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.welcomeTitle} numberOfLines={1}>{t('welcome_title')}</Text>
            <Text style={styles.welcomeSubtitle}>{t('welcome_subtitle')}</Text>
            <TouchableOpacity 
              style={styles.streakBadge}
              activeOpacity={0.85}
              onPress={() => router.push('/streak')}
            >
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>Daily Streak</Text>
            </TouchableOpacity>
          </View>
 
          {/* AI Tutor Card */}
          <View style={styles.aiTutorCard}>
            <View style={styles.aiTutorContent}>
              <Text style={styles.aiTutorTitle}>{t('ai_tutor')}</Text>
              <Text style={styles.aiTutorDesc} numberOfLines={2}>{t('ai_tutor_desc')}</Text>
              <TouchableOpacity 
                style={styles.chatNowBtn}
                onPress={() => router.push('/unlimited-talk')}
              >
                <Text style={styles.chatNowText}>{t('chat_now')}</Text>
              </TouchableOpacity>
            </View>
            <Image 
              source={require('../../assets/images/ai_tutor.png')} 
              style={styles.aiTutorImage}
              contentFit="contain"
            />
          </View>
 
           {/* Lessons Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('your_lessons')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/practice')}>
              <Text style={styles.viewAllText}>{t('view_all')}</Text>
            </TouchableOpacity>
          </View>

          {/* Phase Selector Tabs */}
          <View style={styles.phaseTabsContainer}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((phase) => (
              <TouchableOpacity
                key={phase}
                style={[
                  styles.phaseTab,
                  selectedPhase === phase && styles.activePhaseTab
                ]}
                onPress={() => setSelectedPhase(phase)}
              >
                <Text style={[
                  styles.phaseTabLabel,
                  selectedPhase === phase && styles.activePhaseTabLabel
                ]}>
                  {phase === 'beginner' ? 'Beginner' : phase === 'intermediate' ? 'Intermediate' : 'Advanced'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
 
          {/* Lessons List */}
          {loading ? (
            <ActivityIndicator size="large" color={PRIMARY_BLUE} style={{ marginTop: 20 }} />
          ) : (
            lessons
              .filter(l => l.phase === selectedPhase)
              .map((lesson) => {
                const isActive = lesson.status === 'active' || lesson.status === 'completed';
                const isLocked = lesson.status === 'locked';
                const progress = lesson.progress;
                
                return (
                  <TouchableOpacity 
                    key={lesson.id} 
                    style={[
                      styles.lessonCard, 
                      { borderLeftColor: isActive ? PRIMARY_BLUE : '#94A3B8' }
                    ]}
                    onPress={() => {
                      if (isLocked) {
                        Alert.alert("Lesson Locked", "This lesson will unlock tomorrow! Complete one lesson per day to maintain your streak.");
                        return;
                      }
                      if (lesson.status === 'completed') {
                        Alert.alert("Lesson Completed", "You have already completed this lesson! Come back tomorrow to unlock the next one.");
                        return;
                      }
                      router.push({ pathname: '/lesson-details', params: { id: lesson.id } });
                    }}
                    activeOpacity={isLocked || lesson.status === 'completed' ? 1 : 0.7}
                  >
                    <View style={styles.lessonCardInner}>
                      <View style={styles.lessonTextContainer}>
                        <View style={styles.lessonHeaderRow}>
                          <Text style={styles.lessonNumber}>{t('lesson')} {lesson.lessonId || lesson.dayNumber}</Text>
                          {isLocked && <Ionicons name="lock-closed" size={18} color={PRIMARY_BLUE} style={{ marginLeft: 6 }} />}
                        </View>
                        <Text style={styles.lessonTitleText}>
                          {lesson.displayTitle}
                        </Text>
                        <Text style={styles.lessonDescText} numberOfLines={2}>
                          {lesson.displayDesc}
                        </Text>
                        
                        <View style={styles.progressArea}>
                          <View style={styles.progressBarBg}>
                            <View 
                              style={[
                                styles.progressBarFill, 
                                { width: `${progress}%`, backgroundColor: isActive ? PRIMARY_BLUE : '#D1D5DB' }
                              ]} 
                            />
                          </View>
                          <Text style={styles.progressText}>{progress}% {t('completed')}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.lessonImageContainer}>
                        <Image 
                          source={getLessonImage(lesson.lessonId || lesson.dayNumber || 1)} 
                          style={styles.lessonImage}
                          contentFit="contain"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
          )}
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    height: 60,
  },
  headerLeft: {
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#004D73',
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  iconBtn: {
    marginRight: 12,
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 26,
    fontFamily: 'Nunito-ExtraBold',
    color: '#000000',
    letterSpacing: -0.5,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  streakText: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  aiTutorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  aiTutorContent: {
    flex: 1,
    paddingRight: 8,
  },
  aiTutorTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginBottom: 2,
  },
  aiTutorDesc: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
    maxWidth: '90%',
  },
  chatNowBtn: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  chatNowText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
  },
  aiTutorImage: {
    width: 110,
    height: 95,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  viewAllText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: PRIMARY_BLUE,
  },
  phaseTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  phaseTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  activePhaseTab: {
    backgroundColor: '#004D73',
    borderColor: '#004D73',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  phaseTabLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  activePhaseTabLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  lessonCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  lessonTextContainer: {
    flex: 1.4,
    paddingRight: 8,
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  lessonNumber: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: PRIMARY_BLUE,
  },
  lessonTitleText: {
    fontSize: 17,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 2,
  },
  lessonDescText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 14,
    marginBottom: 6,
  },
  progressArea: {
    marginTop: 'auto',
  },
  progressBarBg: {
    height: 5,
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  lessonImageContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  lessonImage: {
    width: 95,
    height: 85,
  },
});
