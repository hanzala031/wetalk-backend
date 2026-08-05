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
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const HEADING_COLOR = '#0F172A';
const TEXT_GRAY = '#6B7280';
const WHITE = '#FFFFFF';
const TEAL_COLOR = '#00A3AD';

export default function PronunciationDetails() {
  const router = useRouter();
  const { userToken } = useAuth();
  const [syllables, setSyllables] = useState<any[]>([]);
  const [wordsToMaster, setWordsToMaster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      if (!userToken) return;
      const res = await apiClient.get('/user/sync', authConfig(userToken));
      if (res.data?.success && res.data.progressData) {
        const p = res.data.progressData;
        const pronData = p.pronunciation_stats ? JSON.parse(p.pronunciation_stats) : null;
        
        if (pronData) {
          setSyllables(pronData.lastAnalysis || []);
          setWordsToMaster(pronData.wordsToMaster || []);
        } else {
          // Default empty if none
          setSyllables([]);
          setWordsToMaster([]);
        }
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        console.warn('Error fetching pronunciation data:', error);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={HEADING_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pronunciation</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainCard}>
          <View style={styles.wordRow}>
            <Text style={styles.mainWord}>Phenomenon</Text>
            <TouchableOpacity style={styles.soundButton}>
              <Ionicons name="volume-medium-outline" size={24} color={HEADING_COLOR} />
            </TouchableOpacity>
          </View>
          <Text style={styles.phoneticText}>/fəˈnɒmɪnən/</Text>

          <View style={styles.micSection}>
            <View style={styles.micOuterCircle}>
              <View style={styles.micInnerCircle}>
                <Ionicons name="mic" size={32} color={WHITE} />
              </View>
            </View>
            <Text style={styles.tapToRecord}>TAP TO RECORD</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Syllable Stress Analysis</Text>
          <View style={styles.syllableContainer}>
            {syllables.length > 0 ? syllables.map((item, index) => (
              <View key={index} style={styles.syllableItem}>
                <View style={[styles.syllableBar, { backgroundColor: item.color === '#004D73' ? '#004D73' : '#FEE2E2' }]}>
                    {item.color === '#EF4444' ? <View style={[styles.errorBarFill, { backgroundColor: '#EF4444' }]} /> : null}
                </View>
                <Text style={[styles.syllableLabel, item.isStressed ? styles.stressedLabel : null]}>{item.label}</Text>
                <Text style={[styles.syllableStatus, { color: item.color }]}>{item.status}</Text>
              </View>
            )) : (
              <Text style={{ textAlign: 'center', flex: 1, color: TEXT_GRAY }}>No recent analysis. Tap record to start.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Words to Master</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {wordsToMaster.length > 0 ? (
            wordsToMaster.map((item, index) => (
              <TouchableOpacity key={index} style={styles.wordListItem}>
                <View style={styles.wordListInfo}>
                  <Text style={styles.listItemWord}>{item.word}</Text>
                  <Text style={styles.listItemDifficulty}>Difficulty: {item.difficulty}</Text>
                  <Text style={styles.listItemScore}>{item.score}</Text>
                </View>
                <View style={styles.wordListAction}>
                  <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={{ marginTop: 20 }} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyProgress}>
                <Text style={{ color: TEXT_GRAY }}>No words to master yet. Keep practicing!</Text>
            </View>
          )}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerCardTitle}>Master Word Stress</Text>
          <Text style={styles.footerCardDesc}>
            Learn how emphasize specific syllables like a native speaker.
          </Text>
          <TouchableOpacity style={styles.startLessonBtn}>
            <Text style={styles.startLessonText}>Start Lesson</Text>
            <Ionicons name="open-outline" size={16} color={HEADING_COLOR} />
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: WHITE,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FBFDFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30, // Increased top padding
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainWord: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginRight: 10,
  },
  soundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneticText: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
    marginBottom: 30,
  },
  micSection: {
    alignItems: 'center',
  },
  micOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  micInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TEAL_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: TEAL_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tapToRecord: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: HEADING_COLOR,
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#64748B',
  },
  syllableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  syllableItem: {
    alignItems: 'center',
    flex: 1,
  },
  syllableBar: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  errorBarFill: {
    width: '40%',
    height: '100%',
    borderRadius: 3,
  },
  syllableLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 4,
  },
  stressedLabel: {
    textDecorationLine: 'underline',
  },
  syllableStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  entrepreneurCard: {
    backgroundColor: TEAL_COLOR,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  entrepreneurWord: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: WHITE,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: WHITE,
    borderRadius: 2,
  },
  accuracyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: WHITE,
  },
  practiceNowBtn: {
    backgroundColor: WHITE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  practiceNowText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
  },
  wordListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  wordListInfo: {
    flex: 1,
  },
  listItemWord: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 4,
  },
  listItemDifficulty: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    marginBottom: 12,
  },
  listItemScore: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
  },
  wordListAction: {
    alignItems: 'flex-end',
  },
  emptyProgress: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: WHITE,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  footerCard: {
    backgroundColor: '#E9E9F0',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
  },
  footerCardTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginBottom: 8,
  },
  footerCardDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: HEADING_COLOR,
    marginBottom: 20,
    lineHeight: 20,
  },
  startLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startLessonText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
    marginRight: 6,
  },
});
