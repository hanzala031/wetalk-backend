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
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const PRIMARY_COLOR = '#004D73';
const HEADING_COLOR = '#0F172A';
const TEXT_GRAY = '#6B7280';
const WHITE = '#FFFFFF';
const BG_COLOR = '#F8FAFC';

export default function GrammarTakeaways() {
  const router = useRouter();
  const { userToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [takeaways, setTakeaways] = useState<any[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, target: 15 });

  const fetchData = async () => {
    try {
      if (!userToken) return;
      const res = await apiClient.get('/user/sync', authConfig(userToken));
      if (res.data?.success && res.data.progressData) {
        const p = res.data.progressData;
        const grammarData = p.grammar_stats ? JSON.parse(p.grammar_stats) : null;
        
        if (grammarData) {
          setTakeaways(grammarData.takeaways || []);
          setWeeklyGoal(grammarData.weeklyGoal || { current: 0, target: 15 });
        } else {
          setTakeaways([]);
          setWeeklyGoal({ current: 0, target: 15 });
        }
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        console.warn('Error fetching grammar data:', error);
      }
    } finally {
      setLoading(false);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={HEADING_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grammar Takeaways</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={TEXT_GRAY} style={styles.searchIcon} />
          <TextInput 
            placeholder="Search grammar topics..." 
            style={styles.searchInput}
            placeholderTextColor={TEXT_GRAY}
          />
        </View>

        {/* Dynamic Takeaways Cards */}
        {takeaways.length > 0 ? takeaways.map((item, index) => (
          <View key={index} style={styles.card}>
            {item.badge && (
                <View style={styles.cardHeader}>
                    <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                    <MaterialCommunityIcons name={"sparkles" as any} size={20} color="#CBD5E1" />
                </View>
            )}
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <View style={styles.cardIcons}>
                  <Ionicons name="chatbox-outline" size={18} color={TEXT_GRAY} />
                  <Ionicons name="flash-outline" size={18} color={TEXT_GRAY} style={{ marginLeft: 8 }} />
              </View>
              <TouchableOpacity style={styles.reviewLessonBtn}>
                <Text style={styles.reviewLessonText}>Review Lesson</Text>
                <Ionicons name="arrow-forward" size={16} color={WHITE} />
              </TouchableOpacity>
            </View>
          </View>
        )) : (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
             <Text style={{ color: TEXT_GRAY }}>No grammar takeaways yet. Complete lessons to see insights here!</Text>
          </View>
        )}

        {/* Weekly Goal Card */}
        <View style={styles.goalCard}>
            <View style={styles.goalProgressContainer}>
                <Svg width={70} height={70} style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle
                        cx={35}
                        cy={35}
                        r={30}
                        stroke="#E2E8F0"
                        strokeWidth={6}
                        fill="transparent"
                    />
                    <Circle
                        cx={35}
                        cy={35}
                        r={30}
                        stroke={PRIMARY_COLOR}
                        strokeWidth={6}
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - weeklyGoal.current/weeklyGoal.target)}`}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </Svg>
                <View style={styles.goalTextCenter}>
                    <Text style={styles.goalRatio}>{weeklyGoal.current}/{weeklyGoal.target}</Text>
                </View>
            </View>
            <Text style={styles.goalTitle}>Weekly Goal</Text>
            <Text style={styles.goalDesc}>
                {weeklyGoal.current >= weeklyGoal.target ? "Goal reached! Excellent work." : `Review ${weeklyGoal.target - weeklyGoal.current} more rules to reach your target.`}
            </Text>
            <View style={styles.goalProgressBarBg}>
                <View style={[styles.goalProgressBarFill, { width: `${(weeklyGoal.current / weeklyGoal.target) * 100}%` }]} />
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: WHITE,
  },
  headerBtn: {
    padding: 4,
    position: 'absolute',
    left: 20,
    top: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
  },
  scrollView: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: HEADING_COLOR,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: TEXT_GRAY,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 22,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12, gap: 8,
  },
  reviewLessonText: {
    color: WHITE,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  outlinedBtn: {
    borderWidth: 1.5,
    borderColor: HEADING_COLOR,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlinedBtnText: {
    color: HEADING_COLOR,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  imageCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    height: 220,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageCardContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 26, 51, 0.7)', // Overlay color to match screenshot
    padding: 24,
    justifyContent: 'flex-end',
  },
  imageCardTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: WHITE,
    marginBottom: 8,
  },
  masteryText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  practiceLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceLinkText: {
    color: WHITE,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: '#EDF4FF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  goalProgressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTextCenter: {
    position: 'absolute',
  },
  goalRatio: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
  },
  goalTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 8,
  },
  goalDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  goalProgressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    borderRadius: 3,
  },
  goalProgressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 3,
  },
});
