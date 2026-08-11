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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Image } from 'expo-image';
import { useLanguage } from '@/context/language-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProgress } from '@/hooks/use-user-progress';
import { apiClient, authConfig } from '@/lib/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCompletedLessonsCount,
  getLearningLevel,
  getTotalWordsLearned,
  getWeeklyGoalProgress,
  TOTAL_LESSONS,
} from '@/lib/progress-utils';
import { getEarnedBadges } from '@/lib/badges';

const { width } = Dimensions.get('window');

// Colors from the image
const BACKGROUND_COLOR = '#FFFFFF';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const ACCENT_BLUE = '#004D73';
const BADGE_BG = '#EBF5FF';
const LOGOUT_RED = '#EF4444';
const BORDER_COLOR = '#F3F4F6';

const CircularProgress = ({ progress = 80, size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ACCENT_BLUE}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );
};

export default function ProfileScreen() {
  const { userName, userAvatar, userEmail, userToken } = useAuth();
  const { t } = useLanguage();
  const { progressData, streakCount, loading } = useUserProgress();
  const [wtCoins, setWtCoins] = useState<number>(50);

  useFocusEffect(
    React.useCallback(() => {
      async function loadProfileCoins() {
        if (!userToken) return;
        try {
          const res = await apiClient.get('/user/profile', authConfig(userToken));
          if (res.data?.success && res.data.user) {
            setWtCoins(res.data.user.wtCoins || 50);
            
            // Sync user_stats locally
            const statsStr = await AsyncStorage.getItem('user_stats');
            const stats = statsStr ? JSON.parse(statsStr) : { xp: 0, coins: 0, gems: 10, streak: 0 };
            stats.coins = res.data.user.wtCoins || 50;
            await AsyncStorage.setItem('user_stats', JSON.stringify(stats));
          }
        } catch (err) {
          console.log('Failed to fetch profile coins:', err);
        }
      }
      loadProfileCoins();
    }, [userToken])
  );

  const completedLessons = getCompletedLessonsCount(progressData);
  const totalWordsLearned = getTotalWordsLearned(progressData);
  const weeklyGoal = getWeeklyGoalProgress(progressData);
  const levelLabel = getLearningLevel(completedLessons);
  const earnedBadges = getEarnedBadges(progressData, streakCount).slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Spacer to balance settings button */}
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('profile')}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: (userAvatar && userAvatar !== 'default-avatar.png') ? userAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=004D73&color=fff` }} 
              style={styles.avatarImageMain} 
            />
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={20} color={ACCENT_BLUE} />
            </View>
          </View>
          <Text style={styles.userName}>{userName || 'User'}</Text>
          <View style={styles.badgesContainer}>
            <TouchableOpacity 
              style={styles.coinsBadge}
              onPress={() => router.push('/wt-coin-details')}
              activeOpacity={0.8}
            >
              <View style={styles.coinsBadgeInner}>
                <Image 
                  source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1785220344/WT_Coin_udvbma.png' }}
                  style={styles.coinImageProfile}
                  contentFit="contain"
                />
                <Text style={styles.coinsBadgeText}>{wtCoins.toLocaleString()} WT Coins</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fire" size={24} color={TEXT_PRIMARY} />
            <Text style={styles.statValue}>{streakCount}</Text>
            <Text style={styles.statLabel}>{t('day_streak')}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="translate" size={24} color={TEXT_PRIMARY} />
            <Text style={styles.statValue}>{totalWordsLearned}</Text>
            <Text style={styles.statLabel}>{t('words')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={24} color={TEXT_PRIMARY} />
            <Text style={styles.statValue}>{completedLessons}</Text>
            <Text style={styles.statLabel}>{t('lessons')}</Text>
          </View>
        </View>

        {/* Weekly Goal Section */}
        <View style={styles.goalCard}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{t('weekly_goal')}</Text>
            <Text style={styles.goalSubtitle}>
              {weeklyGoal.completed} of {weeklyGoal.target} lessons completed
            </Text>
          </View>
          <CircularProgress progress={weeklyGoal.percent} size={70} strokeWidth={8} />
        </View>

        {/* Achievements Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('achievements')}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/achievements')}>
            <Text style={styles.viewAllText}>{t('view_all')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsScroll}
        >
          {earnedBadges.length > 0 ? (
            earnedBadges.map((badge) => (
              <View key={badge.id} style={styles.achievementCard}>
                <View style={[styles.achievementIconCircle, { backgroundColor: badge.bgColor }]}>
                  {badge.iconType === 'material' ? (
                    <MaterialCommunityIcons name={badge.iconName as any} size={24} color={badge.color} />
                  ) : (
                    <Ionicons name={badge.iconName as any} size={24} color={badge.color} />
                  )}
                </View>
                <Text style={styles.achievementLabel}>{badge.name}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyBadgeCard}>
              <Text style={styles.emptyBadgeText}>Complete lessons to earn badges</Text>
            </View>
          )}
        </ScrollView>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          <MenuItem 
            icon={<Feather name="user" size={20} color={TEXT_SECONDARY} />} 
            title={t('edit_profile')} 
            onPress={() => router.push('/edit-profile')}
          />
          <MenuItem 
            icon={<Ionicons name="stats-chart-outline" size={20} color={TEXT_SECONDARY} />} 
            title={t('learning_statistics')} 
            onPress={() => router.push('/learning-statistics')}
          />
          <MenuItem 
            icon={<Ionicons name="ribbon-outline" size={20} color={TEXT_SECONDARY} />} 
            title={t('my_certificates')} 
            onPress={() => router.push('/certificates')}
          />
          <MenuItem 
            icon={<Ionicons name="card-outline" size={20} color={TEXT_SECONDARY} />} 
            title={t('subscription_plan')} 
            onPress={() => router.push('/subscription-plan')}
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, title, isLast, onPress, textColor = TEXT_PRIMARY }: any) => (
  <TouchableOpacity 
    style={[styles.menuItem, !isLast && styles.menuItemBorder]} 
    onPress={onPress}
  >
    <View style={styles.menuItemLeft}>
      {icon}
      <Text style={[styles.menuItemTitle, { color: textColor }]}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#004D73',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarImageMain: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: BADGE_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelBadgeText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: ACCENT_BLUE,
  },
  coinsBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinImageProfile: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  coinsBadgeText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#D97706',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 60) / 3,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 30,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
  },
  progressText: {
    position: 'absolute',
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#1E3A8A',
  },
  achievementsScroll: {
    paddingLeft: 20,
    paddingBottom: 25,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    width: 110,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  emptyBadgeCard: {
    backgroundColor: '#FFFFFF',
    minWidth: 180,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginRight: 15,
    justifyContent: 'center',
  },
  emptyBadgeText: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: TEXT_PRIMARY,
  },
});
