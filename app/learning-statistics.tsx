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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#64748B';
const WHITE = '#FFFFFF';
const BG_COLOR = '#F8FAFC';

const CircularProgress = ({ progress = 75, size = 60, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={PRIMARY_BLUE}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.circularProgressText}>{progress}%</Text>
    </View>
  );
};

export default function LearningStatistics() {
  const { userToken } = useAuth();
  const [streakCount, setStreakCount] = useState(0);
  const [stats, setStats] = useState({
    totalHours: 0,
    wordsMastered: 0,
    avgAccuracy: 0,
    lessonsDone: 0,
    skills: {
        grammar: 0,
        vocabulary: 0,
        listening: 0,
        speaking: 0
    },
    milestones: []
  });
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      if (!userToken) return;
      const config = authConfig(userToken);
      const [streakRes, syncRes] = await Promise.all([
        apiClient.get('/streak/status', config),
        apiClient.get('/user/sync', config)
      ]);
      
      if (streakRes.data?.success) {
        setStreakCount(streakRes.data.data.currentStreak || 0);
      }
      
      if (syncRes.data?.success && syncRes.data.progressData) {
        const p = syncRes.data.progressData;
        const userStats = p.user_stats ? JSON.parse(p.user_stats) : {};
        const completed = p.completed_lessons ? JSON.parse(p.completed_lessons) : [];
        const skillProgress = p.skill_progress ? JSON.parse(p.skill_progress) : {};
        
        setStats({
          totalHours: userStats.totalHours || 0,
          wordsMastered: userStats.wordsMastered || 0,
          avgAccuracy: userStats.avgAccuracy || 0,
          lessonsDone: completed.length || 0,
          skills: {
              grammar: skillProgress.grammar || 0,
              vocabulary: skillProgress.vocabulary || 0,
              listening: skillProgress.listening || 0,
              speaking: skillProgress.speaking || 0
          },
          milestones: p.milestones || []
        });

        setWeeklyActivity(p.weekly_activity || [
            { day: 'Mon', value: 0 }, { day: 'Tue', value: 0 }, { day: 'Wed', value: 0 },
            { day: 'Thu', value: 0, active: true }, { day: 'Fri', value: 0 },
            { day: 'Sat', value: 0 }, { day: 'Sun', value: 0 }
        ]);
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        console.warn('Error fetching stats:', error);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [userToken])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Statistics</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="settings-outline" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Weekly Activity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Activity</Text>
            <TouchableOpacity style={styles.filterBadge}>
              <Text style={styles.filterText}>Last 7 Days</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>120m</Text>
              <Text style={styles.yAxisLabel}>90m</Text>
              <Text style={styles.yAxisLabel}>60m</Text>
              <Text style={styles.yAxisLabel}>30m</Text>
            </View>
            <View style={styles.barsContainer}>
              {weeklyActivity.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barBackground}>
                    <View 
                      style={[
                        styles.barFill, 
                        { height: item.value },
                        item.active && styles.activeBar
                      ]} 
                    />
                  </View>
                  <Text style={[styles.barLabel, item.active && styles.activeBarLabel]}>
                    {item.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Total Learning Time Card */}
        <View style={styles.totalTimeCard}>
          <View style={styles.totalTimeContent}>
            <Text style={styles.totalTimeLabel}>Total Learning Time</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeValue}>{stats.totalHours}</Text>
              <Text style={styles.timeUnit}>hours</Text>
            </View>
            <View style={styles.trendRow}>
              <Ionicons name="trending-up" size={16} color="#4ADE80" />
              <Text style={styles.trendText}>12% from last month</Text>
            </View>
          </View>
          <Ionicons name="time-outline" size={60} color="rgba(255,255,255,0.1)" style={styles.bgIcon} />
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard 
            icon={<Ionicons name="book-outline" size={20} color={TEXT_PRIMARY} />} 
            label="WORDS MASTERED" 
            value={stats.wordsMastered.toLocaleString()} 
          />
          <StatCard 
            icon={<Ionicons name="ribbon-outline" size={20} color={TEXT_PRIMARY} />} 
            label="AVG ACCURACY" 
            value={`${stats.avgAccuracy}%`} 
          />
          <StatCard 
            icon={<Ionicons name="checkmark-circle-outline" size={20} color={TEXT_PRIMARY} />} 
            label="LESSONS DONE" 
            value={stats.lessonsDone.toString()} 
          />
          <StatCard 
            icon={<MaterialCommunityIcons name="fire" size={20} color={TEXT_PRIMARY} />} 
            label="ACTIVE STREAK" 
            value={`${streakCount} Day${streakCount === 1 ? '' : 's'}`} 
          />
        </View>

        {/* Skill Breakdown */}
        <Text style={styles.sectionTitle}>Skill Breakdown</Text>
        <SkillCard title="Grammar" level="Progress" progress={stats.skills?.grammar || 0} />
        <SkillCard title="Vocabulary" level="Progress" progress={stats.skills?.vocabulary || 0} />
        <SkillCard title="Listening" level="Progress" progress={stats.skills?.listening || 0} />
        <SkillCard title="Speaking" level="Progress" progress={stats.skills?.speaking || 0} />

        {/* Recent Milestones */}
        <View style={styles.milestonesHeader}>
          <Text style={styles.sectionTitle}>Recent Milestones</Text>
        </View>

        <View style={styles.milestonesList}>
          {stats.milestones && stats.milestones.length > 0 ? (
            stats.milestones.map((item: any, index: number) => (
              <MilestoneItem 
                key={index}
                icon={<MaterialCommunityIcons name="medal-outline" size={24} color="#F97316" />} 
                bg="#FFEDD5"
                title={item.title}
                desc={item.desc}
              />
            ))
          ) : (
            <View style={styles.emptyMilestones}>
                <Text style={styles.emptyMilestonesText}>No recent milestones yet. Keep learning!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ icon, label, value }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>{icon}</View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const SkillCard = ({ title, level, progress }: any) => (
  <View style={styles.skillCard}>
    <CircularProgress progress={progress} size={80} strokeWidth={6} />
    <Text style={styles.skillTitle}>{title}</Text>
    <Text style={styles.skillLevel}>{level}</Text>
  </View>
);

const MilestoneItem = ({ icon, bg, title, desc }: any) => (
  <View style={styles.milestoneItem}>
    <View style={[styles.milestoneIconContainer, { backgroundColor: bg }]}>
      {icon}
    </View>
    <View style={styles.milestoneContent}>
      <View style={styles.milestoneHeaderRow}>
        <Text style={styles.milestoneTitle}>{title}</Text>
      </View>
      <Text style={styles.milestoneDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  filterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: TEXT_SECONDARY,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 180,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 15,
    paddingBottom: 25,
  },
  yAxisLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    fontFamily: 'Nunito-Regular',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    width: (width - 120) / 7,
  },
  barBackground: {
    width: 20,
    height: 140,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
  },
  activeBar: {
    backgroundColor: PRIMARY_BLUE,
  },
  barLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    marginTop: 8,
    fontFamily: 'Nunito-Regular',
  },
  activeBarLabel: {
    color: TEXT_PRIMARY,
    fontFamily: 'Nunito-Bold',
  },
  totalTimeCard: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  totalTimeContent: {
    flex: 1,
    zIndex: 1,
  },
  totalTimeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 5,
  },
  timeValue: {
    color: WHITE,
    fontSize: 40,
    fontFamily: 'Nunito-Bold',
  },
  timeUnit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginLeft: 8,
    fontFamily: 'Nunito-SemiBold',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  trendText: {
    color: WHITE,
    fontSize: 12,
    marginLeft: 5,
    fontFamily: 'Nunito-SemiBold',
  },
  bgIcon: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: WHITE,
    width: (width - 55) / 2,
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginTop: 15,
    marginBottom: 20,
  },
  skillCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  skillTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginTop: 15,
  },
  skillLevel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  circularProgressText: {
    position: 'absolute',
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: TEXT_SECONDARY,
  },
  milestonesList: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 10,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  milestoneItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  milestoneIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  milestoneTime: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
  },
  milestoneDesc: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  emptyMilestones: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMilestonesText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
  },
});
