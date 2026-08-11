import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLessonWithFallback } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_GRAY = '#6B7280';
const BORDER_COLOR = '#F1F5F9';
const SUCCESS_GREEN = '#E8F5E9';
const TEXT_GREEN = '#2E7D32';

export default function LessonReviewScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { userAvatar, syncProgressToBackend, userToken } = useAuth();

  const [lessonTitle, setLessonTitle] = useState('Lesson');

  useEffect(() => {
    const activeLessonId = lessonId || '1';
    const markReviewCompleted = async () => {
      try {
        await AsyncStorage.setItem(`completed_review_${activeLessonId}`, 'true');
        await AsyncStorage.setItem(`lesson_finished_${activeLessonId}`, 'true');
        
        // Also add to completed_lessons
        const completedStr = await AsyncStorage.getItem('completed_lessons');
        let completed = completedStr ? JSON.parse(completedStr) : [];
        if (!completed.includes(activeLessonId)) {
          completed.push(activeLessonId);
          await AsyncStorage.setItem('completed_lessons', JSON.stringify(completed));
        }

        await syncProgressToBackend();
      } catch (e) {
        console.error('Error saving review completion:', e);
      }
    };
    markReviewCompleted();

    // Fetch lesson title
    getLessonWithFallback(activeLessonId, userToken).then((currentLesson) => {
      if (currentLesson && currentLesson.title) {
        setLessonTitle(currentLesson.title);
      }
    });
  }, [lessonId, userToken]);

  const safeLessonTitle = (lessonTitle || 'lesson').toLowerCase();

  const learnedItems = [
    { id: 1, title: '1. Learn New Words', subtitle: `Learn vocabulary and key phrases for ${safeLessonTitle}.`, icon: 'book-outline' },
    { id: 2, title: '2. Practice', subtitle: `Practice ${safeLessonTitle} in real conversations.`, icon: 'pencil-outline' },
    { id: 3, title: '3. Quiz', subtitle: 'Test your knowledge with a quick quiz.', icon: 'help-circle-outline' },
    { id: 4, title: '4. Review', subtitle: 'Review what you learned in this lesson.', icon: 'star-outline' },
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
          <Text style={styles.headerTitle}>Review</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color={PRIMARY_BLUE} />
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
          
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroBackground}>
              <View style={styles.confettiContainer}>
                {/* Mock confetti with small colored views if needed, or just the image */}
              </View>
              <Image 
                source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779529007/70fac5027e7c3164ac620834c440c5644fab3f2f_aynvsg.png' }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
            
            {/* Stats Cards Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIconCircle, { backgroundColor: '#E8EFFF' }]}>
                  <Ionicons name="library-outline" size={18} color={PRIMARY_BLUE} />
                </View>
                <Text style={styles.statLabel}>4 topic Complete</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name={"target" as any} size={18} color="#2E7D32" />
                </View>
                <Text style={styles.statLabel}>100% lesson score</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconCircle, { backgroundColor: '#FFF4E5' }]}>
                  <Ionicons name="time-outline" size={18} color="#FF9800" />
                </View>
                <Text style={styles.statLabel}>12 min time spent</Text>
              </View>
            </View>
          </View>

          {/* List Section */}
          <Text style={styles.sectionTitle}>What You Learned</Text>
          <View style={styles.contentListCard}>
            {learnedItems.map((item, index) => (
              <View key={item.id} style={[styles.contentItem, index === learnedItems.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.contentIconWrapper}>
                  <Ionicons name={item.icon as any} size={20} color={PRIMARY_BLUE} />
                </View>
                <View style={styles.contentText}>
                  <Text style={styles.contentItemTitle}>{item.title}</Text>
                  <Text style={styles.contentItemSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Success Card */}
          <View style={styles.successCard}>
            <View style={styles.successLeft}>
              <View style={styles.starCircle}>
                <Ionicons name="star" size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.successTitle}>You are doing Excellent!</Text>
                <Text style={styles.successSubtitle}>Keep practice to become more confident in english</Text>
              </View>
            </View>
            <Image 
              source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779527962/party_popper_z3j1v8.png' }}
              style={styles.partyPopper}
              resizeMode="contain"
            />
          </View>

          {/* Completion Text */}
          <View style={styles.completionFooter}>
            <Text style={styles.lessonCompletedTitle}>Lesson Completed!</Text>
            <Text style={styles.lessonCompletedSubtitle}>{"You're one step closer to fluency."}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.reviewAgainBtn} onPress={() => router.back()}>
              <Ionicons name="refresh-outline" size={20} color={PRIMARY_BLUE} />
              <Text style={styles.reviewAgainText}>Review again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/(tabs)')}>
              <Ionicons name="home" size={20} color="#FFFFFF" />
              <Text style={styles.homeBtnText}>Go to home</Text>
            </TouchableOpacity>
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
  heroSection: {
    marginTop: 10,
    marginBottom: 24,
  },
  heroBackground: {
    height: 220,
    backgroundColor: '#F0F7FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: -40,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  contentListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
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
  },
  contentItemSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
  },
  completedBadge: {
    backgroundColor: SUCCESS_GREEN,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: TEXT_GREEN,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
  },
  successLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  starCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  successTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#2E7D32',
  },
  successSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
    paddingRight: 10,
  },
  partyPopper: {
    width: 50,
    height: 50,
  },
  completionFooter: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lessonCompletedTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 4,
  },
  lessonCompletedSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  reviewAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: '48%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  reviewAgainText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginLeft: 8,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: '48%',
    borderRadius: 16,
    backgroundColor: PRIMARY_BLUE,
  },
  homeBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
