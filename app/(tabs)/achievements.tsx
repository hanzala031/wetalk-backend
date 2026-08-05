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
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError, logApiError } from '@/lib/api-client';

const NAVY = '#004D73';
const SLATE_GRAY = '#64748B';
const BLUE_ACCENT = '#004D73';
const LIGHT_BLUE = '#EFF6FF';

const OverallCircularProgress = ({ progress = 0, size = 110, strokeWidth = 10 }) => {
  const p = Math.max(0, Math.min(100, progress || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (p / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={BLUE_ACCENT}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressInnerLabelContainer}>
        <Text style={styles.progressPercentageText}>{p}%</Text>
        <Text style={styles.progressSubtext}>Overall</Text>
      </View>
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
      const config = authConfig(userToken, { timeout: 10000 });
      
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
  // progressData is a flat AsyncStorage key-value object
  const completedLessons = (() => {
    try {
      const raw = progressData?.['completed_lessons'];
      if (!raw) return 0;
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(arr) ? arr.length : 0;
    } catch { return 0; }
  })();
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);
  // XP is stored in user_stats as JSON
  const totalPoints = (() => {
    try {
      const raw = progressData?.['user_stats'];
      if (!raw) return 0;
      const stats = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return stats?.xp || 0;
    } catch { return 0; }
  })();

  const handleBadgePress = (badgeName: string) => {
    Alert.alert(
      "🎖️ Badge Earned!",
      `You've successfully completed the criteria to unlock the "${badgeName}" badge! Keep learning to earn more.`,
      [{ text: "Great!" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Your Progress Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Your Progress</Text>
          
          <View style={styles.progressRow}>
            {/* Progress circle */}
            <View style={styles.progressCircleContainer}>
              <OverallCircularProgress progress={progressPercent} />
            </View>

            {/* Progress stats list */}
            <View style={styles.statsList}>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="book-outline" size={16} color="#1D4ED8" />
                </View>
                <Text style={styles.statLabel}>Lessons Completed</Text>
                <Text style={styles.statValueBlue}>{completedLessons} / {totalLessons}</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#FFF7ED' }]}>
                  <MaterialCommunityIcons name="fire" size={16} color="#F97316" />
                </View>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValueOrange}>{streakCount} {streakCount === 1 ? 'Day' : 'Days'}</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#FEFCE8' }]}>
                  <Ionicons name="star-outline" size={16} color="#D97706" />
                </View>
                <Text style={styles.statLabel}>Total Points</Text>
                <Text style={styles.statValueYellow}>{totalPoints}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <TouchableOpacity onPress={() => router.push('/all-badges')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Badges Row */}
        <View style={styles.badgesRow}>
          {/* First Steps Badge */}
          <TouchableOpacity 
            style={styles.badgeCard} 
            activeOpacity={0.8}
            onPress={() => handleBadgePress("First Steps")}
          >
            <View style={[styles.badgeCircle, { 
              borderColor: completedLessons >= 1 ? '#3B82F6' : '#E2E8F0', 
              backgroundColor: completedLessons >= 1 ? '#EFF6FF' : '#F9FAFB' 
            }]}>
              <MaterialCommunityIcons name="handshake" size={22} color={completedLessons >= 1 ? "#1D4ED8" : "#94A3B8"} />
            </View>
            <Text style={styles.badgeName} numberOfLines={1}>First Steps</Text>
            <Text style={styles.badgeDesc} numberOfLines={1}>Complete Lesson 1</Text>
          </TouchableOpacity>

          {/* Consistent Learner Badge */}
          <TouchableOpacity 
            style={styles.badgeCard} 
            activeOpacity={0.8}
            onPress={() => handleBadgePress("Consistent Learner")}
          >
            <View style={[styles.badgeCircle, { 
              borderColor: streakCount >= 3 ? '#F97316' : '#E2E8F0', 
              backgroundColor: streakCount >= 3 ? '#FFF7ED' : '#F9FAFB' 
            }]}>
              <MaterialCommunityIcons name="fire" size={22} color={streakCount >= 3 ? "#F97316" : "#94A3B8"} />
            </View>
            <Text style={styles.badgeName} numberOfLines={1}>Consistent Learner</Text>
            <Text style={styles.badgeDesc} numberOfLines={1}>3 Day Streak</Text>
          </TouchableOpacity>

          {/* Quick Learner Badge */}
          <TouchableOpacity 
            style={styles.badgeCard} 
            activeOpacity={0.8}
            onPress={() => handleBadgePress("Quick Learner")}
          >
            <View style={[styles.badgeCircle, { 
              borderColor: completedLessons >= 5 ? '#10B981' : '#E2E8F0', 
              backgroundColor: completedLessons >= 5 ? '#ECFDF5' : '#F9FAFB' 
            }]}>
              <Ionicons name="book" size={18} color={completedLessons >= 5 ? "#10B981" : "#94A3B8"} />
            </View>
            <Text style={styles.badgeName} numberOfLines={1}>Quick Learner</Text>
            <Text style={styles.badgeDesc} numberOfLines={1}>Complete 5 Lessons</Text>
          </TouchableOpacity>
        </View>



        {/* Recent Achievements Section */}
        <Text style={styles.recentSectionTitle}>Recent Achievements</Text>
        
        {/* Achievements Card list */}
        <View style={styles.recentCard}>
          {/* Item 1 */}
          <TouchableOpacity 
            style={styles.recentItem}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Achievement Log", "Completed Lesson 2: Vocabulary Basics")}
          >
            <View style={[styles.recentIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="book" size={18} color="#10B981" />
            </View>
            <View style={styles.recentTextContainer}>
              <Text style={styles.recentItemTitle}>Completed Lesson 2</Text>
              <Text style={[styles.recentPoints, { color: '#10B981' }]}>+50 Points</Text>
            </View>
            <Text style={styles.recentTime}>Just now</Text>
            <Ionicons name="chevron-forward" size={15} color="#94A3B8" style={styles.chevron} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Item 2 */}
          <TouchableOpacity 
            style={styles.recentItem}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Achievement Log", "Streak Maintained: 2 consecutive days")}
          >
            <View style={[styles.recentIconBg, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="fire" size={18} color="#F97316" />
            </View>
            <View style={styles.recentTextContainer}>
              <Text style={styles.recentItemTitle}>2 Day Streak</Text>
              <Text style={[styles.recentPoints, { color: '#F97316' }]}>+20 Points</Text>
            </View>
            <Text style={styles.recentTime}>1 hour ago</Text>
            <Ionicons name="chevron-forward" size={15} color="#94A3B8" style={styles.chevron} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Item 3 */}
          <TouchableOpacity 
            style={styles.recentItem}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Achievement Log", "First Steps Badge Unlocked!")}
          >
            <View style={[styles.recentIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="star" size={18} color={BLUE_ACCENT} />
            </View>
            <View style={styles.recentTextContainer}>
              <Text style={styles.recentItemTitle}>{"Earned \"First Steps\" Badge"}</Text>
              <Text style={[styles.recentPoints, { color: BLUE_ACCENT }]}>+30 Points</Text>
            </View>
            <Text style={styles.recentTime}>2 hours ago</Text>
            <Ionicons name="chevron-forward" size={15} color="#94A3B8" style={styles.chevron} />
          </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#004D73',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13.5,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.015,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  progressInnerLabelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentageText: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  progressSubtext: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginTop: 2,
  },
  statsList: {
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statLabel: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    flex: 1,
  },
  statValueBlue: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#1D4ED8',
    marginLeft: 'auto',
  },
  statValueOrange: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#F97316',
    marginLeft: 'auto',
  },
  statValueYellow: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#D97706',
    marginLeft: 'auto',
  },
  keepGoingBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  keepGoingText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
  },
  viewAllText: {
    fontSize: 13,
    color: '#004D73',
    fontFamily: 'Inter-SemiBold',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badgeCard: {
    width: '31%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 9.5,
    fontFamily: 'Nunito-Bold',
    color: '#0B2A4A',
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 7.5,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2.5,
  },
  badgeDate: {
    fontSize: 7.5,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#1D4ED8',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  recentSectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#0B2A4A',
    marginBottom: 12,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 12.5,
    fontFamily: 'Nunito-Bold',
    color: '#0B2A4A',
  },
  recentPoints: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
  recentTime: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginRight: 4,
  },
  chevron: {
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
