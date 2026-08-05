import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/auth-context';
import { apiClient, authConfig } from '@/lib/api-client';


const NAVY = '#0B2A4A';
const LIGHT_BLUE = '#EFF6FF';
const BORDER_BLUE = '#BFDBFE';
const TEXT_BLUE = '#1D4ED8';

// Cohesive Animated Robot Avatar matching the AI Tutor design
const RobotAvatar = ({ size = 64 }: { size?: number }) => {
  const headWidth = size * 0.65;
  const headHeight = size * 0.52;
  const headRadius = size * 0.18;
  const eyeSize = size * 0.14;
  const eyeGap = size * 0.08;
  const mouthWidth = size * 0.22;
  const mouthHeight = size * 0.045;
  const mouthRadius = mouthHeight / 2;
  
  const [blinkAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const blinkSequence = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const interval = setInterval(() => {
      blinkSequence();
    }, 2000); // Blinks every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const eyeScaleY = blinkAnim;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Robot Antenna */}
      <View style={{ width: size * 0.06, height: size * 0.12, backgroundColor: '#004D73', borderRadius: size * 0.03, marginBottom: -2 }} />
      <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06, backgroundColor: '#38BDF8', marginBottom: -4, zIndex: 1 }} />
      
      {/* Robot Head */}
      <View style={{
        width: headWidth,
        height: headHeight,
        borderRadius: headRadius,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#004D73',
        paddingTop: size * 0.08,
        alignItems: 'center',
        shadowColor: '#004D73',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}>
        {/* Eyes Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: size * 0.02 }}>
          {/* Left Eye */}
          <Animated.View style={{
            width: eyeSize,
            height: eyeSize,
            borderRadius: eyeSize / 2,
            backgroundColor: '#0B2A4A',
            transform: [{ scaleY: eyeScaleY }],
            marginRight: eyeGap,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{ width: eyeSize * 0.4, height: eyeSize * 0.4, borderRadius: eyeSize * 0.2, backgroundColor: '#38BDF8' }} />
          </Animated.View>

          {/* Right Eye */}
          <Animated.View style={{
            width: eyeSize,
            height: eyeSize,
            borderRadius: eyeSize / 2,
            backgroundColor: '#0B2A4A',
            transform: [{ scaleY: eyeScaleY }],
            marginLeft: eyeGap,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{ width: eyeSize * 0.4, height: eyeSize * 0.4, borderRadius: eyeSize * 0.2, backgroundColor: '#38BDF8' }} />
          </Animated.View>
        </View>

        {/* Mouth */}
        <View style={{
          width: mouthWidth,
          height: mouthHeight,
          borderRadius: mouthRadius,
          backgroundColor: '#004D73',
          marginTop: size * 0.06,
        }} />
      </View>
    </View>
  );
};

// Stunning pure CSS vector representation of the Target Board with Arrow
const TargetBoard = () => {
  return (
    <View style={{ width: 70, height: 70, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      {/* Outer pink circle */}
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 6,
        borderColor: '#FF2E63',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF2E63',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      }}>
        {/* Middle ring */}
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 5,
          borderColor: '#FF2E63',
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Inner bullseye */}
          <View style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: '#FF2E63',
          }} />
        </View>
      </View>
      
      {/* Arrow Shaft (Diagonal Line) */}
      <View style={{
        position: 'absolute',
        width: 48,
        height: 4,
        backgroundColor: '#3B82F6',
        transform: [{ rotate: '-45deg' }],
        top: 33,
        left: 2,
        zIndex: 2,
      }} />
      
      {/* Arrowhead (Triangle) */}
      <View style={{
        position: 'absolute',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#1D4ED8',
        transform: [{ rotate: '45deg' }],
        top: 19,
        left: 36,
        zIndex: 3,
      }} />

      {/* Arrow Feathers */}
      <View style={{
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: '#93C5FD',
        transform: [{ rotate: '-45deg' }],
        top: 48,
        left: 4,
        zIndex: 1,
      }} />
    </View>
  );
};

export default function StreakScreen() {
  const [pulsingFire] = useState(new Animated.Value(1));

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDay = new Date().getDay();
  // Map Sun (0) to index 6, otherwise todayDay - 1
  const currentDayIndex = todayDay === 0 ? 6 : todayDay - 1;

  const { userToken } = useAuth();
  const [streakCount, setStreakCount] = useState(1);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpTarget, setXpTarget] = useState(50);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);

  // Reload streak data every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadAllStreakData = async () => {

        // Helper: format a Date as YYYY-MM-DD in local time
        const fmtLocal = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        // ── 1. Gather all completion_date_ entries from AsyncStorage ─────────
        let completionDates = new Set<string>();
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          const cKeys = allKeys.filter(k => k.startsWith('completion_date_'));
          if (cKeys.length > 0) {
            const pairs = await AsyncStorage.multiGet(cKeys);
            pairs.forEach(([, v]) => { if (v) completionDates.add(v.trim()); });
          }
        } catch (e) { console.error('Error reading completion dates:', e); }

        const todayStr = fmtLocal(new Date());
        const completedToday = completionDates.has(todayStr);

        // ── 2. Build Mon–Sun weekly progress from local data ─────────────────
        const todayDate = new Date();
        const jsDay = todayDate.getDay(); // 0=Sun, 1=Mon … 6=Sat
        const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
        const monday = new Date(todayDate);
        monday.setDate(todayDate.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);

        const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const localWeekly = weekDayNames.map((dayName, i) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const dateStr = fmtLocal(d);
          return { dayName, dateString: dateStr, goalAchieved: completionDates.has(dateStr) };
        });
        setWeeklyProgress(localWeekly);

        // ── 3. Daily XP goal: 50 if any lesson done today, else 0 ───────────
        setXpEarned(completedToday ? 50 : 0);
        setXpTarget(50);

        // ── 4. Streak count from local user_stats ────────────────────────────
        let localStreak = completedToday ? 1 : 0;
        try {
          const statsStr = await AsyncStorage.getItem('user_stats');
          if (statsStr) {
            const stats = JSON.parse(statsStr);
            localStreak = Math.max(stats.streak || 0, localStreak);
          }
        } catch (e) { console.error('Error reading local stats:', e); }
        setStreakCount(localStreak);

        // ── 5. Backend (optional) — only raise streak, never lower ──────────
        if (!userToken) return;
        try {
          const res = await apiClient.get('/streak/status', authConfig(userToken));
          if (res.data?.success) {
            const { currentStreak } = res.data.data;
            // Only update if backend streak is HIGHER than local
            if ((currentStreak || 0) > localStreak) {
              setStreakCount(currentStreak);
            }
            // ⚠️ We do NOT use todayXpEarned or weeklyProgress from backend
            // because the XP call may not have reached the server yet
          }
        } catch (_) { /* network error — local data already shown */ }
      };

      loadAllStreakData();
    }, [userToken])
  );


  useEffect(() => {
    // Elegant pulsing animation for the giant fire
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulsingFire, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulsingFire, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handleClaimReward = (xp: number) => {
    Alert.alert(
      "🎁 Reward Claimed!",
      `Congratulations! You've claimed your +${xp} XP daily streak reward! Keep learning daily to unlock more.`,
      [{ text: "Awesome!" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Streak</Text>
        <MaterialCommunityIcons name="fire" size={28} color="#FF6B00" />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1 Day Streak Summary section */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryTitle}>{`${streakCount} Day Streak`}</Text>
            <Text style={styles.summarySubtitle}>{"Keep it up! You're doing great!"}</Text>
            
            {/* Small light blue tip banner */}
            <View style={styles.tipBadge}>
              <View style={styles.starCircle}>
                <Ionicons name="star" size={10} color="#FFFFFF" />
              </View>
              <Text style={styles.tipBadgeText}>Learn Everyday to build your streak.</Text>
            </View>
          </View>

          {/* Large glowing Fire illustration on the right */}
          <View style={styles.fireContainer}>
            <View style={styles.fireGlowOuter}>
              <Animated.View style={[styles.fireGlowInner, { transform: [{ scale: pulsingFire }] }]}>
                <MaterialCommunityIcons name="fire" size={52} color="#FF4500" />
              </Animated.View>
            </View>
          </View>
        </View>

        {/* This Week card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>This Week</Text>
            <Text style={styles.cardHeaderValue}>{`${weeklyProgress.length > 0 ? weeklyProgress.filter(d => d.goalAchieved).length : 0}/7 Days`}</Text>
          </View>

          {/* 7 Days Row */}
          <View style={styles.daysRow}>
            {weekdays.map((day, index) => {
              const dayProgress = weeklyProgress[index];
              const goalAchieved = dayProgress ? dayProgress.goalAchieved : false;
              const isCurrent = index === currentDayIndex;
              
              return (
                <View key={day} style={styles.dayCol}>
                  <Text style={[styles.dayName, isCurrent && styles.dayNameActive]}>
                    {day}
                  </Text>
                  {goalAchieved ? (
                    <View style={[styles.dayCircle, styles.dayCircleChecked]}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  ) : isCurrent ? (
                    <View style={[styles.dayCircle, styles.dayCircleCurrent]}>
                      <Text style={styles.dayCircleTextCurrent}>{index + 1}</Text>
                    </View>
                  ) : (
                    <View style={styles.dayCircle}>
                      <Text style={styles.dayCircleText}>{index + 1}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.cardFooterText}>Learn tomorrow to keep your streak alive!</Text>
        </View>

        {/* Daily Goal Card */}
        <View style={styles.card}>
          <View style={styles.goalRow}>
            <View style={styles.goalLeft}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Daily Goal</Text>
                <Text style={styles.cardHeaderValue}>{xpEarned}/{xpTarget} XP</Text>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min((xpEarned / xpTarget) * 100, 100)}%` }]} />
              </View>

              <Text style={styles.goalFeedback}>
                {xpEarned >= xpTarget ? (
                  "You have completed today's goal!"
                ) : (
                  <>
                    {"You're "}
                    <Text style={{ fontFamily: 'Inter-Bold', color: NAVY }}>{Math.max(xpTarget - xpEarned, 0)} XP</Text>
                    {" away from completing today's goal!"}
                  </>
                )}
              </Text>
            </View>

            {/* Target Board Image */}
            <View style={styles.goalRight}>
              <Image 
                source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779773536/8d876ca2-2fc4-43fd-966e-901cb0221271_removalai_preview_ergdfu.png' }}
                style={styles.goalTargetImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Streak Rewards Section */}
        <View style={styles.rewardsSection}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.rewardsTitle}>Streak Rewards</Text>
            <TouchableOpacity onPress={() => Alert.alert("Rewards Info", "Complete daily lessons to unlock special XP reward chests!")}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {/* Row of 4 Rewards chests */}
          <View style={styles.chestsRow}>
            {[
              { id: 1, xp: 50, requiredDays: 7 },
              { id: 2, xp: 150, requiredDays: 14 },
              { id: 3, xp: 200, requiredDays: 21 },
              { id: 4, xp: 250, requiredDays: 28 },
            ].map((chest) => {
              const isUnlocked = streakCount >= chest.requiredDays;
              return (
                <TouchableOpacity 
                  key={chest.id}
                  style={[
                    styles.rewardChest, 
                    !isUnlocked && { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', shadowColor: 'transparent', elevation: 0 }
                  ]} 
                  activeOpacity={isUnlocked ? 0.8 : 1}
                  onPress={() => {
                    if (isUnlocked) {
                      handleClaimReward(chest.xp);
                    } else {
                      Alert.alert("Locked", `Complete a ${chest.requiredDays}-day streak to unlock this reward!`);
                    }
                  }}
                >
                  <Text style={[styles.rewardXp, !isUnlocked && { color: '#94A3B8' }]}>{chest.xp} XP</Text>
                  <Ionicons 
                    name={isUnlocked ? "gift" : "lock-closed"} 
                    size={isUnlocked ? 32 : 24} 
                    color={isUnlocked ? NAVY : "#94A3B8"} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Daily tips Card */}
        <View style={[styles.card, styles.tipsCard]}>
          <View style={styles.tipsLeft}>
            <View style={styles.tipsTitleRow}>
              <View style={styles.tipsIconBg}>
                <Ionicons name="bulb" size={15} color={TEXT_BLUE} />
              </View>
              <Text style={styles.tipsTitle}>Daily tips</Text>
            </View>
            <Text style={styles.tipsText}>
              You learn daily and collect daily Streaks earn many Rewards
            </Text>
          </View>

          <View style={styles.tipsRight}>
            <Image 
              source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779345793/47306607-a224-47cb-94eb-6538c4e375fd_removalai_preview_gtszq4.png' }}
              style={styles.tipsRobotImage}
              resizeMode="contain"
            />
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    height: 64,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLeft: {
    flex: 1.6,
  },
  summaryTitle: {
    fontSize: 26,
    fontFamily: 'Nunito-ExtraBold',
    color: '#0B2A4A',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  starCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#004D73',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  tipBadgeText: {
    fontSize: 10.5,
    color: '#004D73',
    fontFamily: 'Inter-SemiBold',
  },
  fireContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  fireGlowOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 107, 0, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireGlowInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: '#0B2A4A',
  },
  cardHeaderValue: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: '#1D4ED8',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  dayCol: {
    alignItems: 'center',
  },
  dayName: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  dayNameActive: {
    color: '#0B2A4A',
    fontFamily: 'Inter-Bold',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dayCircleChecked: {
    backgroundColor: '#0B2A4A',
    borderColor: '#0B2A4A',
  },
  dayCircleCurrent: {
    borderColor: '#0B2A4A',
    borderWidth: 1.5,
  },
  dayCircleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  dayCircleTextCurrent: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#0B2A4A',
  },
  cardFooterText: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLeft: {
    flex: 1,
  },
  goalRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  goalTargetImage: {
    width: 70,
    height: 70,
  },
  progressBarBg: {
    height: 9,
    backgroundColor: '#EFF6FF',
    borderRadius: 4.5,
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFF6FF',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0B2A4A',
    borderRadius: 4.5,
  },
  goalFeedback: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    marginTop: 10,
  },
  rewardsSection: {
    marginBottom: 16,
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: '#0B2A4A',
  },
  viewAllText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontFamily: 'Inter-SemiBold',
  },
  chestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardChest: {
    flex: 1,
    height: 90,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  rewardXp: {
    fontSize: 11.5,
    fontFamily: 'Nunito-Bold',
    color: '#0B2A4A',
    marginBottom: 6,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 18,
  },
  tipsLeft: {
    flex: 1,
  },
  tipsRight: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsRobotImage: {
    width: 85,
    height: 85,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipsIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  tipsTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: '#0B2A4A',
  },
  tipsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    marginTop: 8,
    lineHeight: 18,
  },
});
