import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Rect, Polygon, Line, Ellipse } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError, logApiError } from '@/lib/api-client';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

const NAVY = '#004D73';
const TEXT_DARK = '#0F172A';
const SLATE_GRAY = '#64748B';
const BLUE_ACCENT = '#004D73';

const TrophySvg = () => (
  <Svg width={80} height={80} viewBox="0 0 100 100">
    {/* Base Pedestal */}
    <Rect x="30" y="78" width="40" height="8" rx="3" fill="#94A3B8" />
    <Rect x="35" y="70" width="30" height="8" rx="2" fill="#CBD5E1" />
    <Path d="M 46 70 L 54 70 L 52 58 L 48 58 Z" fill="#64748B" />

    {/* Handles */}
    <Path d="M 33 26 C 20 26, 20 46, 33 46 Z" fill="none" stroke="#004D73" strokeWidth="4.5" strokeLinecap="round" />
    <Path d="M 67 26 C 80 26, 80 46, 67 46 Z" fill="none" stroke="#004D73" strokeWidth="4.5" strokeLinecap="round" />

    {/* Trophy Cup */}
    <Path d="M 32 20 L 68 20 C 68 44, 62 58, 50 58 C 38 58, 32 44, 32 20 Z" fill="#004D73" />
    <Ellipse cx="50" cy="20" rx="18" ry="3.5" fill="#106796" />
    
    {/* Star inside trophy */}
    <Polygon points="50,28 53,35 60,36 55,41 57,48 50,44 43,48 45,41 40,36 47,35" fill="#FFFFFF" />
  </Svg>
);

const CertificateSvg = () => (
  <Svg width={46} height={34} viewBox="0 0 50 36">
    <Rect x="1" y="1" width="48" height="34" rx="4" fill="#FFFFFF" stroke="#004D73" strokeWidth="2" />
    <Line x1="8" y1="9" x2="30" y2="9" stroke="#93C5FD" strokeWidth="2" />
    <Line x1="8" y1="16" x2="24" y2="16" stroke="#93C5FD" strokeWidth="1.5" />
    <Line x1="8" y1="23" x2="20" y2="23" stroke="#93C5FD" strokeWidth="1.5" />
    {/* Ribbon seal */}
    <Circle cx="38" cy="23" r="5" fill="#F59E0B" />
    <Polygon points="37,25 35,31 39,29 41,31 39,25" fill="#EF4444" />
  </Svg>
);

const MiniProgressBar = ({ progress = 0 }) => {
  const p = Math.max(0, Math.min(100, progress));
  return (
    <View style={styles.miniProgressTrack}>
      <View style={[styles.miniProgressFill, { width: `${p}%` }]} />
    </View>
  );
};

export default function AchievementsScreen() {
  const router = useRouter();
  const { userToken } = useAuth();
  const [streakCount, setStreakCount] = useState(0);
  const [progressData, setProgressData] = useState<any>(null);

  const fetchData = async () => {
    try {
      if (!userToken) {
        setProgressData({});
        return;
      }
      const config = authConfig(userToken, { timeout: 3000 });
      
      const [streakRes, syncRes] = await Promise.all([
        apiClient.get('/streak/status', config),
        apiClient.get('/user/sync', config)
      ]);

      if (streakRes.data?.success) {
        setStreakCount(streakRes.data.data.currentStreak || 0);
      }
      if (syncRes.data?.success) {
        setProgressData(syncRes.data.progressData || {});
      } else {
        setProgressData({});
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        logApiError('Error fetching achievements data', error);
      }
      setProgressData({});
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [userToken])
  );

  const totalLessons = 15;
  
  // completedLessons is an array of lesson IDs
  const completedLessonsList = (() => {
    try {
      const raw = progressData?.['completed_lessons'];
      if (!raw) return [];
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(arr) ? arr.map(Number) : [];
    } catch { return []; }
  })();
  const completedLessonsCount = completedLessonsList.length;
  const progressPercent = Math.round((completedLessonsCount / totalLessons) * 100);

  // Dynamic Badges count based on 9 total badges
  const earnedBadgesCount = [
    completedLessonsCount >= 1,
    streakCount >= 3,
    completedLessonsCount >= 5,
    completedLessonsCount >= 10,
    false, // Word Master
    false, // Top Performer
    false, // Helpful Learner
    false, // Weak Warrior
    false, // Fluent Speaker
  ].filter(Boolean).length;
  const totalBadgesCount = 9;
  const badgeProgressPercent = totalBadgesCount > 0 ? (earnedBadgesCount / totalBadgesCount) * 100 : 0;

  // Certificates Completion count
  const beginnerCompletedCount = completedLessonsList.filter(l => l >= 1 && l <= 5).length;
  const isBeginnerCompleted = beginnerCompletedCount === 5;

  const intermediateCompletedCount = completedLessonsList.filter(l => l >= 6 && l <= 10).length;
  const isIntermediateCompleted = intermediateCompletedCount === 5;

  const advancedCompletedCount = completedLessonsList.filter(l => l >= 11 && l <= 15).length;
  const isAdvancedCompleted = advancedCompletedCount === 5;

  const completedCerts = [isBeginnerCompleted, isIntermediateCompleted, isAdvancedCompleted].filter(Boolean).length;
  const totalCertsCount = 3;
  const certProgressPercent = (completedCerts / totalCertsCount) * 100;

  const getCompletionDate = (lessonIds: number[]) => {
    try {
      const dates = lessonIds
        .map(id => progressData?.[`completion_date_${id}`])
        .filter(Boolean)
        .map(d => new Date(d));
      if (dates.length === 0) return '—';
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      return maxDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const currentCertDate = isBeginnerCompleted ? getCompletionDate([1, 2, 3, 4, 5]) : 'In Progress';

  const handleBadgePress = (badgeName: string) => {
    Alert.alert(
      "🎖️ Badge Info",
      `Learn and complete lessons to earn the "${badgeName}" badge!`,
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header - kept Achievements text in the top center as requested */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Trophy Banner Card */}
        <View style={styles.trophyBannerCard}>
          <View style={styles.trophyContainer}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785395107/070d60284d143a18c3f901c73534aa7697f21198_hnrvdz.png' }}
              style={{ width: 85, height: 85 }}
              contentFit="contain"
            />
          </View>
          <View style={styles.bannerTextContent}>
            <Text style={styles.bannerTitle}>Great going!</Text>
            <Text style={styles.bannerSubtitle}>
              You're learning, improving and achieving more every day.
            </Text>
            <View style={styles.keepItUpBadge}>
              <Ionicons name="star" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.keepItUpText}>Keep it up! You're doing amazing</Text>
            </View>
          </View>
        </View>

        {/* Your Progress Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Text style={styles.headerProgressPercentage}>Overall Progress {progressPercent}%</Text>
        </View>

        <View style={styles.progressStatsCard}>
          <View style={styles.progressColumnsRow}>
            {/* Column 1: Badges Earned */}
            <View style={styles.progressColumn}>
              <View style={[styles.columnIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="star" size={18} color="#004D73" />
              </View>
              <Text style={styles.columnLabel}>Badges Earned</Text>
              <Text style={styles.columnValue}>{earnedBadgesCount}/{totalBadgesCount}</Text>
              <MiniProgressBar progress={badgeProgressPercent} />
              <Text style={styles.columnPercent}>{Math.round(badgeProgressPercent)}% Completed</Text>
            </View>

            {/* Column 2: Certificates */}
            <View style={styles.progressColumn}>
              <View style={[styles.columnIconCircle, { backgroundColor: '#EEF2F6' }]}>
                <MaterialCommunityIcons name="certificate" size={18} color="#004D73" />
              </View>
              <Text style={styles.columnLabel}>Certificates</Text>
              <Text style={styles.columnValue}>
                {completedCerts}/{totalCertsCount}
              </Text>
              <MiniProgressBar progress={certProgressPercent} />
              <Text style={styles.columnPercent}>{Math.round(certProgressPercent)}% Completed</Text>
            </View>

            {/* Column 3: Lessons Completed */}
            <View style={styles.progressColumn}>
              <View style={[styles.columnIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="book" size={18} color="#004D73" />
              </View>
              <Text style={styles.columnLabel}>Lessons Completed</Text>
              <Text style={styles.columnValue}>
                {completedLessonsCount}/{totalLessons}
              </Text>
              <MiniProgressBar progress={progressPercent} />
              <Text style={styles.columnPercent}>{Math.round(progressPercent)}% Completed</Text>
            </View>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <TouchableOpacity onPress={() => router.push('/all-badges')}>
            <Text style={styles.viewAllText}>View all <Ionicons name="chevron-forward" size={12} color="#004D73" /></Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Badges list */}
        <View style={styles.badgesRow}>
          {/* Badge 1: First Steps */}
          <TouchableOpacity 
            style={styles.badgeCard} 
            activeOpacity={0.8}
            onPress={() => handleBadgePress("First Steps")}
          >
            <View style={[styles.badgeIconCircle, { backgroundColor: '#EFF6FF', borderColor: '#E2E8F0' }]}>
              <FontAwesome5 name="graduation-cap" size={18} color="#004D73" />
            </View>
            <Text style={styles.badgeNameText}>First Steps</Text>
            <Text style={styles.badgeDescText} numberOfLines={2}>Completed Your First Lesson</Text>
            <View style={styles.badgeStatusPill}>
              <Text style={styles.badgeStatusPillText}>Earned</Text>
            </View>
          </TouchableOpacity>

          {/* Badge 2: Streak Master */}
          <TouchableOpacity 
            style={styles.badgeCard} 
            activeOpacity={0.8}
            onPress={() => handleBadgePress("Streak Master")}
          >
            <View style={[styles.badgeIconCircle, { backgroundColor: '#FFF7ED', borderColor: '#E2E8F0' }]}>
              <MaterialCommunityIcons name="fire" size={20} color="#F97316" />
            </View>
            <Text style={styles.badgeNameText}>Streak Master</Text>
            <Text style={styles.badgeDescText} numberOfLines={2}>7 Days Learning Streaks</Text>
            <View style={[styles.badgeStatusPill, streakCount < 7 && styles.badgeStatusPillLocked]}>
              <Text style={styles.badgeStatusPillText}>{streakCount >= 7 ? 'Earned' : 'Locked'}</Text>
            </View>
          </TouchableOpacity>

          {/* Badge 3: World Explorer */}
          <TouchableOpacity 
            style={styles.badgeCard} 
            activeOpacity={0.8}
            onPress={() => handleBadgePress("World Explorer")}
          >
            <View style={[styles.badgeIconCircle, { backgroundColor: '#F0FDF4', borderColor: '#E2E8F0' }]}>
              <Ionicons name="earth" size={18} color="#10B981" />
            </View>
            <Text style={styles.badgeNameText}>World Explorer</Text>
            <Text style={styles.badgeDescText} numberOfLines={2}>Learn 100 new Words</Text>
            <View style={[styles.badgeStatusPill, completedLessonsCount < 15 && styles.badgeStatusPillLocked]}>
              <Text style={styles.badgeStatusPillText}>{completedLessonsCount >= 15 ? 'Earned' : 'Locked'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Certificates Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Certificates</Text>
          <TouchableOpacity onPress={() => router.push('/certificates')}>
            <Text style={styles.viewAllText}>View all <Ionicons name="chevron-forward" size={12} color="#004D73" /></Text>
          </TouchableOpacity>
        </View>

        {/* Certificates Card */}
        <View style={styles.horizontalRowCard}>
          <View style={styles.certIconContainer}>
            <CertificateSvg />
          </View>
          <View style={styles.horizontalCardMiddle}>
            <Text style={styles.horizontalCardTitle}>English basics</Text>
            <Text style={styles.horizontalCardSubtitle}>
              {isBeginnerCompleted ? `Completed on ${currentCertDate}` : 'In Progress'}
            </Text>
            <View style={[styles.completionPill, !isBeginnerCompleted && styles.inProgressPill]}>
              <Text style={[styles.completionPillText, !isBeginnerCompleted && styles.inProgressPillText]}>
                {isBeginnerCompleted ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.downloadIconCircle}
            onPress={() => {
              if (isBeginnerCompleted) {
                Alert.alert("Download", "Downloading certificate PDF...");
              } else {
                Alert.alert("Locked", "Complete Beginner English (Lessons 1-5) to download this certificate.");
              }
            }}
          >
            <Ionicons name="download-outline" size={18} color="#004D73" />
          </TouchableOpacity>
        </View>

        {/* Lesson Completed Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lesson Completed</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/practice')}>
            <Text style={styles.viewAllText}>View all <Ionicons name="chevron-forward" size={12} color="#004D73" /></Text>
          </TouchableOpacity>
        </View>

        {/* Lesson Completed Card */}
        <View style={[styles.horizontalRowCard, { marginBottom: 0 }]}>
          <View style={[styles.bookIconContainer, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="book" size={20} color="#004D73" />
          </View>
          <View style={styles.lessonProgressMiddle}>
            <View style={styles.lessonTitleProgressRow}>
              <Text style={styles.lessonRatioTitle}>{completedLessonsCount} of {totalLessons} Lessons</Text>
              <Text style={styles.lessonPercentLabel}>{progressPercent}%</Text>
            </View>
            <View style={styles.lessonsProgressTrack}>
              <View style={[styles.lessonsProgressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.lessonMotivationText}>
              {progressPercent >= 50 
                ? "You're more than halfway there!" 
                : "Keep learning to achieve more milestones!"}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#004D73',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  trophyBannerCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  trophyContainer: {
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
  },
  bannerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginVertical: 4,
    lineHeight: 16,
  },
  keepItUpBadge: {
    backgroundColor: '#004D73',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 6,
  },
  keepItUpText: {
    fontSize: 9.5,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
  },
  headerProgressPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#004D73',
  },
  progressStatsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  progressColumnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressColumn: {
    alignItems: 'center',
    width: (width - 72) / 3,
  },
  columnIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  columnLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
    height: 24,
  },
  columnValue: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 6,
  },
  miniProgressTrack: {
    width: '75%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#004D73',
    borderRadius: 2,
  },
  columnPercent: {
    fontSize: 8.5,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  viewAllText: {
    fontSize: 12,
    color: '#004D73',
    fontFamily: 'Inter-SemiBold',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  badgeCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  badgeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeNameText: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  badgeDescText: {
    fontSize: 7.5,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 8,
    height: 22,
  },
  badgeStatusPill: {
    backgroundColor: '#004D73',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeStatusPillLocked: {
    backgroundColor: '#CBD5E1',
  },
  badgeStatusPillText: {
    fontSize: 8.5,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  horizontalRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  certIconContainer: {
    marginRight: 12,
  },
  horizontalCardMiddle: {
    flex: 1,
  },
  horizontalCardTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
  },
  horizontalCardSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  completionPill: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  inProgressPill: {
    backgroundColor: '#FFF7ED',
  },
  completionPillText: {
    fontSize: 9.5,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  inProgressPillText: {
    color: '#F97316',
  },
  downloadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonProgressMiddle: {
    flex: 1,
  },
  lessonTitleProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  lessonRatioTitle: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
  },
  lessonPercentLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#004D73',
  },
  lessonsProgressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  lessonsProgressFill: {
    height: '100%',
    backgroundColor: '#004D73',
    borderRadius: 3,
  },
  lessonMotivationText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});
