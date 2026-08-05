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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Polygon } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError, logApiError } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';

const NAVY = '#004D73';
const BLUE_ACCENT = '#1D4ED8';
const SLATE_GRAY = '#64748B';

interface Badge {
  id: string;
  name: string;
  description: string;
  isEarned: boolean;
  date?: string;
  iconName: string;
  iconType: 'ionicons' | 'material';
  color: string;
  bgColor: string;
  progressCurrent?: number;
  progressTotal?: number;
}

const BADGES_DATA: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete Lesson 1',
    isEarned: true,
    date: 'May 10, 2026',
    iconName: 'handshake',
    iconType: 'material',
    color: '#3B82F6', // Blue
    bgColor: '#EFF6FF',
  },
  {
    id: '2',
    name: 'Consistent Learner',
    description: 'Maintain a 3 day streak',
    isEarned: true,
    date: 'May 12, 2026',
    iconName: 'fire',
    iconType: 'material',
    color: '#F97316', // Orange
    bgColor: '#FFF7ED',
  },
  {
    id: '3',
    name: 'Quick Learner',
    description: 'Complete 5 lessons',
    isEarned: true,
    date: 'May 14, 2026',
    iconName: 'book',
    iconType: 'ionicons',
    color: '#10B981', // Green
    bgColor: '#ECFDF5',
  },
  {
    id: '4',
    name: 'Goal Getter',
    description: 'Complete 10 lessons',
    isEarned: false,
    iconName: 'target',
    iconType: 'material',
    color: '#8B5CF6', // Purple
    bgColor: '#F5F3FF',
    progressCurrent: 6,
    progressTotal: 10,
  },
  {
    id: '5',
    name: 'Word Master',
    description: 'Learn 50 new words',
    isEarned: false,
    iconName: 'lock-closed-outline',
    iconType: 'ionicons',
    color: '#A78BFA', // Light Purple
    bgColor: '#FAF5FF',
    progressCurrent: 12,
    progressTotal: 50,
  },
  {
    id: '6',
    name: 'Top Performer',
    description: 'Score 100% on any quiz',
    isEarned: false,
    iconName: 'trophy',
    iconType: 'ionicons',
    color: '#F59E0B', // Gold / Amber
    bgColor: '#FEF3C7',
    progressCurrent: 0,
    progressTotal: 1,
  },
  {
    id: '7',
    name: 'Helpful Learner',
    description: 'Use AI Tutor 5 times',
    isEarned: false,
    iconName: 'heart',
    iconType: 'ionicons',
    color: '#EF4444', // Red
    bgColor: '#FEE2E2',
    progressCurrent: 1,
    progressTotal: 5,
  },
  {
    id: '8',
    name: 'Weak Warrior',
    description: 'Maintain a 7 day streak',
    isEarned: false,
    iconName: 'calendar',
    iconType: 'ionicons',
    color: '#06B6D4', // Cyan
    bgColor: '#ECFEFF',
    progressCurrent: 2,
    progressTotal: 7,
  },
  {
    id: '9',
    name: 'Fluent Speaker',
    description: 'Complete 3 speaking lessons',
    isEarned: false,
    iconName: 'star',
    iconType: 'ionicons',
    color: '#2563EB', // Royal Blue
    bgColor: '#EFF6FF',
    progressCurrent: 0,
    progressTotal: 3,
  },
];

const CircleBadgeIcon = ({ color, bgColor, iconName, iconType }: { color: string; bgColor: string; iconName: string; iconType: 'ionicons' | 'material' }) => {
  return (
    <View style={[styles.badgeCircle, { borderColor: color, backgroundColor: bgColor }]}>
      {iconType === 'material' ? (
        <MaterialCommunityIcons name={iconName as any} size={22} color={color} />
      ) : (
        <Ionicons name={iconName as any} size={18} color={color} />
      )}
    </View>
  );
};

export default function AllBadgesScreen() {
  const router = useRouter();
  const { userToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'earned' | 'locked'>('all');
  const [progressData, setProgressData] = useState<any>(null);
  const [streakCount, setStreakCount] = useState(0);

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

      if (streakRes.data?.success) setStreakCount(streakRes.data.data.currentStreak || 0);
      if (syncRes.data?.success) setProgressData(syncRes.data.progressData || {});
      else setProgressData({});
    } catch (error) {
      if (!isNetworkError(error)) {
        logApiError('Error fetching badges data', error);
      }
      setProgressData({});
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [userToken])
  );

  // Derive completedLessons count from synced progressData
  const completedLessons = (() => {
    if (!progressData) return 0;
    try {
      const raw = progressData['completed_lessons'];
      if (!raw) return 0;
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  })();

  if (!progressData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const BADGES: Badge[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete Lesson 1',
      isEarned: completedLessons >= 1,
      iconName: 'handshake',
      iconType: 'material',
      color: completedLessons >= 1 ? '#3B82F6' : '#94A3B8',
      bgColor: completedLessons >= 1 ? '#EFF6FF' : '#F9FAFB',
    },
    {
      id: '2',
      name: 'Consistent Learner',
      description: 'Maintain a 3 day streak',
      isEarned: streakCount >= 3,
      iconName: 'fire',
      iconType: 'material',
      color: streakCount >= 3 ? '#F97316' : '#94A3B8',
      bgColor: streakCount >= 3 ? '#FFF7ED' : '#F9FAFB',
    },
    {
      id: '3',
      name: 'Quick Learner',
      description: 'Complete 5 lessons',
      isEarned: completedLessons >= 5,
      iconName: 'book',
      iconType: 'ionicons',
      color: completedLessons >= 5 ? '#10B981' : '#94A3B8',
      bgColor: completedLessons >= 5 ? '#ECFDF5' : '#F9FAFB',
    },
    {
      id: '4',
      name: 'Goal Getter',
      description: 'Complete 10 lessons',
      isEarned: completedLessons >= 10,
      iconName: 'target',
      iconType: 'material',
      color: completedLessons >= 10 ? '#8B5CF6' : '#94A3B8',
      bgColor: completedLessons >= 10 ? '#F5F3FF' : '#F9FAFB',
      progressCurrent: completedLessons,
      progressTotal: 10,
    },
    {
      id: '5',
      name: 'Word Master',
      description: 'Learn 50 new words',
      isEarned: false,
      iconName: 'lock-closed-outline',
      iconType: 'ionicons',
      color: '#A78BFA',
      bgColor: '#FAF5FF',
      progressCurrent: 0,
      progressTotal: 50,
    },
    {
      id: '6',
      name: 'Top Performer',
      description: 'Score 100% on any quiz',
      isEarned: false,
      iconName: 'trophy',
      iconType: 'ionicons',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      progressCurrent: 0,
      progressTotal: 1,
    },
    {
      id: '7',
      name: 'Helpful Learner',
      description: 'Use AI Tutor 5 times',
      isEarned: false,
      iconName: 'heart',
      iconType: 'ionicons',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      progressCurrent: 1,
      progressTotal: 5,
    },
    {
      id: '8',
      name: 'Weak Warrior',
      description: 'Maintain a 7 day streak',
      isEarned: false,
      iconName: 'calendar',
      iconType: 'ionicons',
      color: '#06B6D4',
      bgColor: '#ECFEFF',
      progressCurrent: 2,
      progressTotal: 7,
    },
    {
      id: '9',
      name: 'Fluent Speaker',
      description: 'Complete 3 speaking lessons',
      isEarned: false,
      iconName: 'star',
      iconType: 'ionicons',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      progressCurrent: 0,
      progressTotal: 3,
    },
  ];

  const filteredBadges = BADGES.filter((badge) => {
    if (activeTab === 'earned') return badge.isEarned;
    if (activeTab === 'locked') return !badge.isEarned;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navHeaderTitle}>All badges</Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.profileCircle} />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title and Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>All Badges</Text>
          <Text style={styles.subtitle}>Earn badges and celebrate your learning journey!</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All Badges</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'earned' && styles.tabButtonActive]}
            onPress={() => setActiveTab('earned')}
          >
            <Text style={[styles.tabText, activeTab === 'earned' && styles.tabTextActive]}>Earned</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'locked' && styles.tabButtonActive]}
            onPress={() => setActiveTab('locked')}
          >
            <Text style={[styles.tabText, activeTab === 'locked' && styles.tabTextActive]}>Locked</Text>
          </TouchableOpacity>
        </View>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {filteredBadges.map((badge) => {
            return (
              <View key={badge.id} style={styles.badgeCard}>
                {/* Circle icon */}
                <CircleBadgeIcon
                  color={badge.color}
                  bgColor={badge.bgColor}
                  iconName={badge.iconName}
                  iconType={badge.iconType}
                />
                
                {/* Badge Name */}
                <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
                
                {/* Badge Desc */}
                <Text style={styles.badgeDesc} numberOfLines={2}>{badge.description}</Text>

                {/* Badge Status */}
                {badge.isEarned ? (
                  <View style={styles.statusContainer}>
                    <View style={styles.earnedPill}>
                      <Ionicons name="checkmark" size={10} color="#16A34A" />
                      <Text style={styles.earnedText}>Earned</Text>
                    </View>
                    {badge.date && <Text style={styles.dateText}>{badge.date}</Text>}
                  </View>
                ) : (
                  <View style={styles.statusContainer}>
                      {/* Locked Pill */}
                      <View style={styles.lockedPill}>
                        <Ionicons name="lock-closed" size={9} color="#94A3B8" />
                        <Text style={styles.lockedText}>Locked</Text>
                      </View>
                      {badge.progressCurrent !== undefined && badge.progressTotal !== undefined && (
                        <Text style={styles.progressText}>{badge.progressCurrent} / {badge.progressTotal}</Text>
                      )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Footer Banner */}
        <View style={styles.footerBanner}>
          <View style={styles.footerIconBg}>
            <Ionicons name="trophy" size={24} color="#D97706" />
          </View>
          <View style={styles.footerTextContainer}>
            <Text style={styles.footerTitle}>Keep Learning!</Text>
            <Text style={styles.footerSubtitle}>Complete more lessons and challenges to earn new badges and rewards.</Text>
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
  navHeader: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  navHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    marginRight: 12,
    padding: 4,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
  },
  subtitle: {
    fontSize: 13.5,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#004D73',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  badgeCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.015,
    shadowRadius: 6,
    elevation: 1,
  },
  badgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 10,
  },
  badgeDesc: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 11,
    height: 22,
  },
  statusContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  earnedPill: {
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  earnedText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#16A34A',
    marginLeft: 2,
  },
  dateText: {
    fontSize: 7.5,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    marginTop: 4,
    fontWeight: '600',
  },
  lockedPill: {
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  lockedText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#94A3B8',
    marginLeft: 2,
  },
  progressText: {
    fontSize: 8.5,
    fontFamily: 'Inter-Medium',
    fontWeight: '600',
    color: '#1D4ED8',
    marginTop: 4,
  },
  progressWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 2.5,
    width: '80%',
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2.5,
  },
  footerBanner: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  footerTextContainer: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#004D73',
  },
  footerSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
});
