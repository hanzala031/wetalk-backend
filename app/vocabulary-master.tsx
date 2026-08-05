import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError } from '@/lib/api-client';

const { width } = Dimensions.get('window');

// Colors
const PRIMARY_COLOR = '#004D73'; 
const HEADING_COLOR = '#0F172A'; 
const BG_COLOR = '#F8FAFC';
const WHITE = '#FFFFFF';
const TEXT_GRAY = '#64748B';

const CircularProgress = ({ progress, total }: { progress: number; total: string }) => {
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(progress, 100) / 100) * circumference;
  
    return (
      <View style={styles.progressWrapper}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={WHITE}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>
        <View style={styles.progressTextContainer}>
            <Text style={styles.progressNumber}>{total}</Text>
            <Text style={styles.progressSub}>Words Mastered</Text>
        </View>
      </View>
    );
};

export default function VocabularyMaster() {
  const router = useRouter();
  const { userToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalMastered, setTotalMastered] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentSets, setRecentSets] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      if (!userToken) return;
      const res = await apiClient.get('/user/sync', authConfig(userToken));
      if (res.data?.success && res.data.progressData) {
        const p = res.data.progressData;
        const vocabData = p.vocabulary_stats ? JSON.parse(p.vocabulary_stats) : null;
        
        if (vocabData) {
          setTotalMastered(vocabData.totalMastered || 0);
          setCategories(vocabData.categories || []);
          setRecentSets(vocabData.recentSets || []);
        } else {
          setTotalMastered(0);
          setCategories([]);
          setRecentSets([]);
        }
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        console.warn('Error fetching vocabulary data:', error);
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
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={HEADING_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vocabulary Master</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wordOfDayCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop' }} 
            style={styles.wordOfDayImage} 
          />
          <View style={styles.wordOfDayContent}>
            <Text style={styles.wordOfDayLabel}>WORD OF THE DAY</Text>
            <View style={styles.wordRow}>
                <Text style={styles.wordTitle}>Eloquent</Text>
                <Text style={styles.phonetic}>/ˈel.ə.kwənt/</Text>
            </View>
            <Text style={styles.wordDescription}>
              Fluent or persuasive in speaking or writing; clearly expressing or indicating something.
            </Text>
            <View style={styles.wordActions}>
              <TouchableOpacity style={styles.listenBtn}>
                <Ionicons name="volume-medium" size={20} color={WHITE} />
                <Text style={styles.listenBtnText}>Listen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn}>
                <Text style={styles.addBtnText}>Add to Deck</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.masteryCard}>
          <Text style={styles.masteryTitle}>Mastery Progress</Text>
          <CircularProgress progress={totalMastered > 0 ? (totalMastered / 2000) * 100 : 0} total={totalMastered.toLocaleString()} />
          <Text style={styles.masteryQuote}>
            {"\"Your consistency is paying off. Keep building your vocabulary!\""}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.length > 0 ? categories.map((cat, i) => (
              <TouchableOpacity key={i} style={styles.categoryCard}>
                <View style={styles.categoryIconBg}>
                  <Ionicons name={cat.icon as any} size={24} color={HEADING_COLOR} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            )) : (
              <Text style={{ color: TEXT_GRAY, paddingLeft: 10 }}>No categories available.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Word Sets</Text>
          {recentSets.length > 0 ? recentSets.map((set, i) => (
            <View key={i} style={styles.setCard}>
                <View style={styles.setRow}>
                    <View style={[styles.badge, { backgroundColor: set.badgeColor || '#F1F5F9' }]}>
                        <Text style={[styles.badgeText, { color: set.badgeTextColor || '#64748B' }]}>{set.badge || 'LEVEL'}</Text>
                    </View>
                    <Text style={styles.setCountText}>{set.count}</Text>
                </View>
                <Text style={styles.setCardTitle}>{set.title}</Text>
                <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${set.progress || 0}%` }]} />
                    </View>
                </View>
                <View style={styles.setFooter}>
                    <View style={styles.avatarRow}>
                        {['JD', 'AS'].map((init, j) => (
                            <View key={j} style={[styles.avatar, { marginLeft: j === 0 ? 0 : -8 }]}>
                                <Text style={styles.avatarText}>{init}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.studyBtn}>
                        <Text style={styles.studyBtnText}>Study Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
          )) : (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: TEXT_GRAY }}>No recent word sets found.</Text>
            </View>
          )}
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
  wordOfDayCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  wordOfDayImage: {
    width: '100%',
    height: 180,
  },
  wordOfDayContent: {
    padding: 24,
  },
  wordOfDayLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: HEADING_COLOR,
    letterSpacing: 1,
    marginBottom: 12,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  wordTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginRight: 10,
  },
  phonetic: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
  },
  wordDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 22,
    marginBottom: 24,
  },
  wordActions: {
    flexDirection: 'row',
    gap: 12,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  listenBtnText: {
    color: WHITE,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: HEADING_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addBtnText: {
    color: HEADING_COLOR,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  masteryCard: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 32,
  },
  masteryTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: WHITE,
    marginBottom: 20,
  },
  progressWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 32,
    fontFamily: 'Nunito-ExtraBold',
    color: WHITE,
  },
  progressSub: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  masteryQuote: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: WHITE,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 20,
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: TEXT_GRAY,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  categoryCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    width: (width - 55) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  categoryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: BG_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
  },
  setCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  setCountText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: HEADING_COLOR,
    marginBottom: 16,
  },
  setCardTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 12, 
  },
  progressRow: {
    marginBottom: 24,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: BG_COLOR,
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 3,
  },
  setFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: TEXT_GRAY,
  },
  studyBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  studyBtnText: {
    color: WHITE,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
});
