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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLessonWithFallback } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#1F2937';
const TEXT_GRAY = '#6B7280';
const BG_COLOR = '#F8FAFC';
const LIGHT_BLUE = '#E8EFFF';

export default function PracticeIntroScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { userAvatar, userToken } = useAuth();

  const [isListenRepeatCompleted, setIsListenRepeatCompleted] = useState(false);
  const [isFillBlanksCompleted, setIsFillBlanksCompleted] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('Practice');

  const loadProgress = async () => {
    try {
      const activeId = lessonId || '1';
      const listenCompleted = await AsyncStorage.getItem(`completed_listen_repeat_${activeId}`);
      const fillCompleted = await AsyncStorage.getItem(`completed_fill_blanks_${activeId}`);
      setIsListenRepeatCompleted(listenCompleted === 'true');
      setIsFillBlanksCompleted(fillCompleted === 'true');

      const currentLesson = await getLessonWithFallback(activeId, userToken);
      if (currentLesson && currentLesson.title) {
        setLessonTitle(currentLesson.title);
      }
    } catch (e) {
      console.error('Error loading practice progress:', e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [lessonId])
  );

  const safeLessonTitle = (lessonTitle || 'lesson').toLowerCase();

  const practiceActivities = [
    {
      id: 1,
      title: 'Listen & Repeat',
      subtitle: 'Listen to the audio and repeat to\nimprove your pronunciation.',
      icon: 'headset-outline',
      status: isListenRepeatCompleted ? 'Completed' : 'Start',
    },
    {
      id: 2,
      title: 'Fill in the Blanks',
      subtitle: `Complete sentences about ${safeLessonTitle}.`,
      icon: 'book-outline',
      status: isFillBlanksCompleted ? 'Completed' : (isListenRepeatCompleted ? 'Start' : 'Locked'),
    },
    {
      id: 3,
      title: 'Speak Yourself',
      subtitle: `Practice speaking about ${safeLessonTitle}.`,
      icon: 'mic-outline',
      status: isFillBlanksCompleted ? 'Start' : 'Locked',
    },
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
          <Text style={styles.headerTitle}>Practice</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name={"notifications-outline" as any} size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: userAvatar || 'https://api.dicebear.com/7.x/adventurer/png?seed=Felix&size=128' }} 
                style={styles.avatar}
              />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Top Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroInfo}>
              <View style={styles.practiceBadge}>
                <Ionicons name={"pencil" as any} size={12} color={PRIMARY_BLUE} />
                <Text style={styles.practiceBadgeText}>Practice Time</Text>
              </View>
              <Text style={styles.heroTitle}>{"Let's Practice"}</Text>
              <Text style={styles.heroSubtitle}>{"Apply what you've learned and improve your speaking skills."}</Text>
            </View>
            <Image 
              source={require('../assets/images/practice_hero.png')} 
              style={styles.heroIllustration}
              resizeMode="contain"
            />
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Practice Progress</Text>
              <Text style={styles.stepText}>Step 2 of 4</Text>
            </View>
            
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '33.3%' }]} />
                <View style={[styles.progressThumb, { left: '33.3%' }]}>
                  <Text style={styles.thumbText}>2</Text>
                </View>
              </View>
            </View>

            <View style={styles.stepperContainer}>
              <View style={styles.stepperLine} />
              <View style={styles.stepperRow}>
                 {[1, 2, 3, 4].map((step) => {
                   const isCompleted = step < 2;
                   const isActive = step === 2;
                   const showBlueBg = isCompleted || isActive;
                   return (
                     <View key={step} style={styles.stepWrapper}>
                        <View style={[
                          styles.stepCircle, 
                          showBlueBg && styles.activeStepCircle,
                        ]}>
                          {step === 1 ? (
                             <Ionicons name={"book" as any} size={16} color={showBlueBg ? "#FFFFFF" : TEXT_GRAY} />
                          ) : step === 2 ? (
                             <Ionicons name={"pencil" as any} size={16} color={showBlueBg ? "#FFFFFF" : TEXT_GRAY} />
                          ) : step === 3 ? (
                             <Ionicons name={"help-circle" as any} size={16} color={showBlueBg ? "#FFFFFF" : TEXT_GRAY} />
                          ) : (
                             <Ionicons name={"star" as any} size={16} color={showBlueBg ? "#FFFFFF" : TEXT_GRAY} />
                          )}
                          {isCompleted && (
                            <View style={styles.checkBadge}>
                              <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.stepLabel, showBlueBg && styles.activeStepLabel]}>
                          {step === 1 ? '1.Learn' : step === 2 ? '2.Practice' : step === 3 ? '3.Quiz' : '4.Review'}
                        </Text>
                     </View>
                   )
                 })}
              </View>
            </View>
          </View>

          {/* Activity Section */}
          <Text style={styles.sectionTitle}>What will you do in Practice?</Text>
          <View style={styles.activityList}>
            {practiceActivities.map((activity, index) => {
              const isLocked = activity.status === 'Locked';
              const isCompleted = activity.status === 'Completed';
              const activeId = lessonId || 'prof_1';
              
              return (
                <TouchableOpacity 
                  key={activity.id} 
                  style={[
                    styles.activityItem,
                    isLocked && { opacity: 0.5 }
                  ]}
                  disabled={isLocked}
                  onPress={() => {
                    if (index === 0) {
                      router.push({ pathname: '/listen-repeat', params: { word: 'Hello', lessonId: activeId } });
                    } else if (index === 1) {
                      router.push({ pathname: '/fill-blanks', params: { lessonId: activeId } });
                    } else if (index === 2) {
                      router.push({ pathname: '/speak-yourself', params: { lessonId: activeId } });
                    }
                  }}
                >
                  <View style={[styles.activityIconWrapper, isLocked && { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons 
                      name={(isLocked ? "lock-closed-outline" : (index === 0 ? "headset-outline" : index === 1 ? "book-outline" : "mic-outline")) as any} 
                      size={22} 
                      color={isLocked ? "#94A3B8" : PRIMARY_BLUE} 
                    />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={[styles.activityTitle, isLocked && { color: "#94A3B8" }]}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={18} color="#94A3B8" />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={PRIMARY_BLUE} />
                  )}
                </TouchableOpacity>
              );
            })}
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
    position: 'relative',
    overflow: 'hidden',
  },
  heroInfo: {
    flex: 1,
    zIndex: 1,
    paddingRight: 110,
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
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 18,
  },
  heroIllustration: {
    width: 170,
    height: 190,
    position: 'absolute',
    right: 5,
    bottom: -10,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  stepText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  progressBarWrapper: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY_BLUE,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbText: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  stepperContainer: {
    position: 'relative',
  },
  stepperLine: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#E2E8F0',
    zIndex: 0,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  stepWrapper: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  completedStepCircle: {
    backgroundColor: '#FFFFFF',
    borderColor: PRIMARY_BLUE,
  },
  futureStepText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_GRAY,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PRIMARY_BLUE,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 10,
    fontFamily: 'Nunito-Medium',
    color: TEXT_GRAY,
  },
  activeStepLabel: {
    color: '#000000',
    fontFamily: 'Nunito-Bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activityIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityText: {
    flex: 1,
    paddingRight: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  startBtn: {
    backgroundColor: PRIMARY_BLUE,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
});
