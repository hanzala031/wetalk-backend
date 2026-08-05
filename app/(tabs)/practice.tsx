import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig } from '@/lib/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lessonsData from '@/data/lessons.json';

const { width } = Dimensions.get('window');
const NAVY_DARK = '#004D73';
const HEADING_COLOR = '#0F172A';
const BG_COLOR = '#F5F8FF';
const LIGHT_BLUE = '#EDF4FF';
const WHITE = '#FFFFFF';

// Format date as YYYY-MM-DD in local time
const getLocalDateString = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Format date as readable string e.g. "Jun 11"
const formatReadableDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m - 1]} ${d}`;
};

const CircularProgress = ({ progress }: { progress: number }) => {
  const size = 56;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.progressWrapper}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={NAVY_DARK}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
      </Svg>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );
};

const PracticeOption = ({ icon, title, description, actionText, onPress }: any) => (
  <TouchableOpacity 
    style={styles.toolCard}
    onPress={onPress} 
    activeOpacity={0.8}
  >
    <View style={styles.toolRow}>
      <View style={styles.toolIconContainer}>
        {icon}
      </View>
      <View style={styles.toolTextContainer}>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolDesc}>{description}</Text>
      </View>
    </View>
    <View style={styles.toolFooter}>
      <Text style={styles.toolActionText}>{actionText}</Text>
      <Ionicons name="arrow-forward" size={16} color={NAVY_DARK} />
    </View>
  </TouchableOpacity>
);

export default function PracticeScreen() {
  const { t } = useLanguage();
  const { userToken } = useAuth();

  // Streak state
  const [streakCount, setStreakCount] = useState(0);
  const [todayXpEarned, setTodayXpEarned] = useState(0);
  const [dailyXpTarget] = useState(50);

  // Real lesson progress state
  const [recentLessons, setRecentLessons] = useState<{ title: string; progress: number; sub: string }[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const todayStr = getLocalDateString();

        // ── 1. Read all completion_date_ keys ──────────────────────────────
        let completionDates: Record<string, string> = {};
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          const cKeys = allKeys.filter(k => k.startsWith('completion_date_'));
          if (cKeys.length > 0) {
            const pairs = await AsyncStorage.multiGet(cKeys);
            pairs.forEach(([key, val]) => {
              if (val) {
                const lessonId = key.replace('completion_date_', '');
                completionDates[lessonId] = val.trim();
              }
            });
          }
        } catch (e) { console.error(e); }

        // ── 2. Build Recent Progress from real completed lessons ───────────
        const allLessons = (lessonsData as any).lessons || [];
        const completedStr = await AsyncStorage.getItem('completed_lessons');
        const completedIds: string[] = completedStr ? JSON.parse(completedStr) : [];

        if (completedIds.length > 0) {
          // Show last 3 completed lessons (most recent first)
          const recentIds = [...completedIds].reverse().slice(0, 3);
          const items = recentIds.map((id: string) => {
            const lesson = allLessons.find((l: any) => l.id === id);
            const dateStr = completionDates[id] || '';
            const isToday = dateStr === todayStr;
            return {
              title: lesson?.title || `Lesson ${id}`,
              progress: 100,
              sub: `${isToday ? 'Today' : formatReadableDate(dateStr)} • ${lesson?.level || 'Beginner'}`,
            };
          });
          setRecentLessons(items);
        } else {
          setRecentLessons([]);
        }

        // ── 3. Streak & XP (local-first, same as streak page) ─────────────
        const datesSet = new Set(Object.values(completionDates));
        const completedToday = datesSet.has(todayStr);
        setTodayXpEarned(completedToday ? 50 : 0);

        let localStreak = completedToday ? 1 : 0;
        try {
          const statsStr = await AsyncStorage.getItem('user_stats');
          if (statsStr) {
            const stats = JSON.parse(statsStr);
            localStreak = Math.max(stats.streak || 0, localStreak);
          }
        } catch (e) { console.error(e); }
        setStreakCount(localStreak);

        // ── 4. Backend optional — only raise streak ──────────────────────
        if (!userToken) return;
        try {
          const res = await apiClient.get('/streak/status', authConfig(userToken));
          if (res.data?.success) {
            const { currentStreak } = res.data.data;
            if ((currentStreak || 0) > localStreak) setStreakCount(currentStreak);
          }
        } catch (_) { /* silent fail */ }
      };

      loadData();
    }, [userToken])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('practice')}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Unlimited AI Talk Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconCircle}>
                <Ionicons name="mic" size={24} color={NAVY_DARK} />
            </View>
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="trophy-outline" size={14} color={NAVY_DARK} style={{ marginRight: 4 }} />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{t('unlimited_ai_talk')}</Text>
          <Text style={styles.heroDesc}>
            {t('unlimited_ai_talk_desc')}
          </Text>
          <View style={styles.heroFooter}>
            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => router.push('/unlimited-talk-intro')}
            >
              <Text style={styles.startBtnText}>{t('start_session')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logsBtn}>
              <Text style={styles.logsText}>{t('logs')}</Text>
              <MaterialCommunityIcons name="history" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="magic-staff" size={22} color={NAVY_DARK} />
            <Text style={styles.sectionTitle}>{t('learning_tools')}</Text>
        </View>

        <View>
          <PracticeOption
            icon={<MaterialCommunityIcons name="account-voice" size={26} color={NAVY_DARK} />}
            title={t('pronunciation')}
            description={t('pronunciation_desc')}
            actionText={t('practice_now')}
            onPress={() => router.push('/pronunciation-details')}
          />
          <PracticeOption
            icon={<MaterialCommunityIcons name="book-open-page-variant-outline" size={26} color={NAVY_DARK} />}
            title={t('vocabulary')}
            description={t('vocabulary_desc')}
            actionText={t('explore_sets')}
            onPress={() => router.push('/vocabulary-master')}
          />
          <PracticeOption
            icon={<MaterialCommunityIcons name="spellcheck" size={26} color={NAVY_DARK} />}
            title={t('grammar_takeaways')}
            description={t('grammar_takeaways_desc')}
            actionText={t('review_insights')}
            onPress={() => router.push('/grammar-takeaways')}
          />
          
          <TouchableOpacity style={styles.customToolCard}>
            <View style={styles.plusCircle}>
                <Ionicons name="add" size={24} color="#9CA3AF" />
            </View>
            <Text style={styles.customToolTitle}>{t('custom_tool')}</Text>
            <Text style={styles.customToolSub}>{t('custom_tool_desc')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitleOnly}>{t('recent_progress')}</Text>
        
        <View style={styles.progressCard}>
           {recentLessons.length > 0 ? (
             recentLessons.map((item, i) => (
               <View key={i} style={[styles.progressItem, i !== recentLessons.length - 1 && styles.progressItemBorder]}>
                  <CircularProgress progress={item.progress} />
                  <View style={styles.progressTextContainer}>
                    <Text style={styles.progressItemTitle}>{item.title}</Text>
                    <Text style={styles.progressItemSub}>{item.sub}</Text>
                  </View>
               </View>
             ))
           ) : (
             <View style={styles.emptyProgress}>
               <MaterialCommunityIcons name="book-open-outline" size={40} color="#CBD5E1" />
               <Text style={styles.emptyProgressText}>No lessons completed yet</Text>
               <Text style={styles.emptyProgressSub}>Complete your first lesson to see progress here</Text>
             </View>
           )}
           
           <TouchableOpacity style={styles.analyticsBtn} onPress={() => router.push('/(tabs)')}>
             <Text style={styles.analyticsText}>{t('view_detailed_analytics')}</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>{t('practice_streak')}</Text>
          <View style={styles.streakRow}>
              <Text style={styles.streakCount}>{streakCount}</Text>
              <Text style={styles.streakSub}>{t('streak_sub')}</Text>
          </View>
          <View style={styles.streakBarBackground}>
             <View style={[styles.streakBarForeground, { width: `${Math.min((todayXpEarned / dailyXpTarget) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.xpLabel}>
            {todayXpEarned >= dailyXpTarget ? '✓ Daily goal complete!' : `${todayXpEarned}/${dailyXpTarget} XP today`}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: WHITE,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#004D73',
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  scrollView: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 15,
  },
  heroCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  premiumText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: NAVY_DARK,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startBtn: {
    backgroundColor: LIGHT_BLUE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startBtnText: {
    color: NAVY_DARK,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  logsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginRight: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginLeft: 10,
  },
  sectionTitleOnly: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 20,
  },
  toolCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: LIGHT_BLUE,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolTextContainer: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 17,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 18,
  },
  toolFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  toolActionText: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: NAVY_DARK,
    marginRight: 4,
  },
  customToolCard: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  plusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  customToolTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 4,
  },
  customToolSub: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  progressCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  progressItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  progressWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
  },
  progressText: {
    position: 'absolute',
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
  },
  progressTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressItemTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 4,
  },
  progressItemSub: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  analyticsBtn: {
    marginTop: 16,
    backgroundColor: LIGHT_BLUE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  analyticsText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: NAVY_DARK,
  },
  streakCard: {
    backgroundColor: NAVY_DARK,
    borderRadius: 24,
    padding: 24,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  streakLabel: {
    color: WHITE,
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  streakCount: {
    color: WHITE,
    fontSize: 36,
    fontFamily: 'Nunito-ExtraBold',
    marginRight: 8,
  },
  streakSub: {
    color: '#CBD5E1',
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  streakBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  streakBarForeground: {
    height: '100%',
    backgroundColor: WHITE,
    borderRadius: 3,
  },
  xpLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
    textAlign: 'right',
  },
  emptyProgress: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyProgressText: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: '#94A3B8',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyProgressSub: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
