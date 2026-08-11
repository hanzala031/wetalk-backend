import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/auth-context';
import { apiClient, authConfig } from '@/lib/api-client';
import RewardPopup from '@/components/reward-popup';

const { width } = Dimensions.get('window');
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const NAVY_BLUE = '#00334E';

export default function LessonCompletionScreen() {
  const { lessonId, score, totalSteps } = useLocalSearchParams<{ 
    lessonId: string; 
    score: string; 
    totalSteps: string 
  }>();
  
  const [saving, setSaving] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupRewards, setPopupRewards] = useState<any[]>([]);
  const { userToken, syncProgressToBackend } = useAuth();

  useEffect(() => {
    saveLocalProgress();
  }, []);

  const saveLocalProgress = async () => {
    try {
      // 1. Mark lesson completed
      const completedStr = await AsyncStorage.getItem('completed_lessons');
      let completed = completedStr ? JSON.parse(completedStr) : [];
      
      // Ensure we track this specific lesson as finished
      const lessonKey = `lesson_finished_${lessonId}`;
      await AsyncStorage.setItem(lessonKey, 'true');

      if (!completed.includes(lessonId)) {
        completed.push(lessonId);
        await AsyncStorage.setItem('completed_lessons', JSON.stringify(completed));
        
        // Store completion date for this specific lesson
        const todayStr = getLocalDateString();
        await AsyncStorage.setItem(`completion_date_${lessonId}`, todayStr);
      } else {
        // Lesson already completed — make sure completion_date_ key exists
        // (it may be missing from older data before date tracking was added)
        const existingDate = await AsyncStorage.getItem(`completion_date_${lessonId}`);
        if (!existingDate) {
          const todayStr = getLocalDateString();
          await AsyncStorage.setItem(`completion_date_${lessonId}`, todayStr);
        }
      }

      // 2. Update stats locally
      const statsStr = await AsyncStorage.getItem('user_stats');
      let stats = statsStr ? JSON.parse(statsStr) : { xp: 0, coins: 0, gems: 10, streak: 0 };
      
      // Always award 50 XP for completing a lesson (matches the backend dailyXpTarget)
      const LESSON_XP_REWARD = 50;
      stats.xp += LESSON_XP_REWARD;
      stats.coins += 10;
      stats.gems += 1;
      
      // Update local streak date tracking
      const todayStr = getLocalDateString();
      const lastDateStr = stats.lastStreakDate || null;
      if (lastDateStr !== todayStr) {
        // New day — update streak date
        stats.lastStreakDate = todayStr;
        stats.streak = (stats.streak || 0) + 1;
      }
      // Keep legacy lastDate too
      stats.lastDate = new Date();

      // Post XP to backend to update UserStreak and get the true currentStreak
      if (userToken) {
        try {
          const response = await apiClient.post('/streak/add-xp', 
            { xpAmount: LESSON_XP_REWARD },
            authConfig(userToken)
          );
          if (response.data && response.data.success) {
            const newStreak = response.data.data.currentStreak;
            // Only use backend streak if it's >= local (backend might lag behind)
            if (newStreak !== undefined && newStreak >= stats.streak) {
              stats.streak = newStreak;
            }
          }
        } catch (apiErr) {
          console.error('Error posting streak XP to backend:', apiErr);
          // Local streak calculation is already updated above as fallback
        }
      }

      await AsyncStorage.setItem('user_stats', JSON.stringify(stats));
      await syncProgressToBackend();

      // Check for pending rewards
      try {
        const pendingStr = await AsyncStorage.getItem('pending_rewards');
        if (pendingStr) {
          const pending = JSON.parse(pendingStr);
          if (Array.isArray(pending) && pending.length > 0) {
            setPopupRewards(pending);
            setPopupVisible(true);
            await AsyncStorage.removeItem('pending_rewards');
          }
        }
      } catch (err) {
        console.error('Error loading pending rewards in completion screen:', err);
      }

      setSaving(false);
    } catch (error) {
      console.error('Error saving local progress:', error);
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={NAVY_BLUE} />
        <Text style={styles.savingText}>Saving your progress...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MotiView 
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={styles.successIconContainer}
        >
           <LinearGradient
             colors={['#0F5B7F', '#00334E']}
             style={styles.gradientCircle}
           >
              <Ionicons name="checkmark" size={80} color="#FFF" />
           </LinearGradient>
        </MotiView>

        <Text style={styles.congratsTitle}>Lesson Complete!</Text>
        <Text style={styles.congratsSubtitle}>You&apos;re doing great! Keep it up.</Text>

        <View style={styles.statsCard}>
           <View style={styles.statBox}>
              <Text style={styles.statLabel}>SCORE</Text>
              <Text style={styles.statValue}>{score}</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.statBox}>
              <Text style={styles.statLabel}>STEPS</Text>
              <Text style={styles.statValue}>{totalSteps}</Text>
           </View>
        </View>

        <View style={styles.rewardSection}>
           <Text style={styles.rewardHeading}>Rewards Earned</Text>
           <View style={styles.rewardsRow}>
              <View style={styles.rewardBadge}>
                 <FontAwesome5 name="coins" size={20} color="#EAB308" />
                 <Text style={styles.rewardAmount}>+10</Text>
              </View>
              <View style={styles.rewardBadge}>
                 <Ionicons name="flash" size={22} color="#38BDF8" />
                 <Text style={styles.rewardAmount}>+50 XP</Text>
              </View>
           </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.doneButton} 
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.doneButtonText}>DONE</Text>
        </TouchableOpacity>
      </View>
      <RewardPopup 
        visible={popupVisible} 
        rewards={popupRewards} 
        onClose={() => setPopupVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  successIconContainer: {
    marginBottom: 40,
  },
  gradientCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#0F5B7F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  congratsTitle: {
    fontSize: 32,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
    marginBottom: 10,
  },
  congratsSubtitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingVertical: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 40,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
    letterSpacing: 1,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
  },
  rewardSection: {
    width: '100%',
    alignItems: 'center',
  },
  rewardHeading: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
    marginBottom: 20,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  rewardAmount: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  doneButton: {
    backgroundColor: '#00334E',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    letterSpacing: 1,
  },
});
