import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const NAVY = '#004D73';
const BG = '#F5F8FF';
const WHITE = '#FFFFFF';
const TEXT_DARK = '#0F172A';
const TEXT_GRAY = '#6B7280';
const LIGHT_BLUE = '#EDF4FF';
const RED = '#EF4444';
const GREEN = '#10B981';

const CORRECTIONS = [
  {
    id: 1,
    wrong: 'I go to the market yesterday.',
    correct: 'I went to the market yesterday.',
    why: 'Use Simple Past tense ("went") for completed actions in the past. "Go" is present tense and cannot be used with "yesterday".',
  },
  {
    id: 2,
    wrong: 'The team are playing well today.',
    correct: 'The team is playing well today.',
    why: 'In American English, collective nouns like "team" take a singular verb ("is"). The team acts as one unit.',
  },
  {
    id: 3,
    wrong: 'She don\'t know the answer.',
    correct: 'She doesn\'t know the answer.',
    why: 'With third-person singular subjects (she/he/it), use "doesn\'t" as the auxiliary verb, not "don\'t".',
  },
];

const CONTEXTUAL_TIPS = [
  { wrong: true,  text: 'I have never felt yesterday.' },
  { wrong: true,  text: 'I like fish yesterday.' },
];

const STATS = [
  { value: '12', label: 'CORRECTIONS' },
  { value: '3',  label: 'NEW RULES' },
  { value: '85%', label: 'ACCURACY' },
];

export default function GrammarTakeaways() {
  const router = useRouter();
  const [corrections, setCorrections] = useState<any[]>(CORRECTIONS);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setLoading(true);
    apiClient.get('/user/grammar-corrections')
      .then((res) => {
        if (res.data && res.data.success && res.data.corrections) {
          setCorrections(res.data.corrections);
          if (res.data.corrections.length > 0) {
            setExpandedId(res.data.corrections[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching grammar corrections:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Header Container with top safe area padding */}
      <View style={{ backgroundColor: WHITE, paddingTop: insets.top || 15 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={NAVY} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">Grammar Takeaways</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Section Label */}
        <View style={styles.sectionRow}>
          <MaterialCommunityIcons name="text-box-check-outline" size={18} color={NAVY} />
          <Text style={styles.sectionTitle}>Corrections from Today</Text>
        </View>

        {/* Correction Cards */}
        {corrections.map((item) => {
          const expanded = expandedId === item.id;
          return (
            <View key={item.id} style={styles.correctionCard}>
              {/* SAY THIS label + sparkle */}
              <View style={styles.correctionHeader}>
                <View style={styles.sayThisBadge}>
                  <Text style={styles.sayThisText}>SAY THIS</Text>
                </View>
                <MaterialCommunityIcons name="shimmer" size={18} color="#CBD5E1" />
              </View>

              {/* Wrong sentence */}
              <View style={styles.sentenceRow}>
                <View style={[styles.sentenceDot, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="close" size={12} color={RED} />
                </View>
                <Text style={styles.wrongText}>{item.wrong}</Text>
              </View>

              {/* Correct sentence */}
              <View style={styles.sentenceRow}>
                <View style={[styles.sentenceDot, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="checkmark" size={12} color={GREEN} />
                </View>
                <Text style={styles.correctText}>{item.correct}</Text>
              </View>

              {/* Why toggle */}
              <TouchableOpacity
                style={styles.whyRow}
                onPress={() => setExpandedId(expanded ? null : item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.whyLabel}>Why?</Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={NAVY}
                />
              </TouchableOpacity>

              {expanded && (
                <View style={styles.whyBox}>
                  <Text style={styles.whyText}>{item.why}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Contextual Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={NAVY} />
            <Text style={styles.tipTitle}>Contextual Tip</Text>
          </View>
          <Text style={styles.tipSubtitle}>
            Don't use Present Perfect (Simple Past) with specific time markers like "yesterday" or "last week".
          </Text>

          <View style={styles.tipExamples}>
            {CONTEXTUAL_TIPS.map((t, i) => (
              <View key={i} style={styles.tipExampleRow}>
                <View style={[styles.sentenceDot, { backgroundColor: '#FEE2E2', marginTop: 2 }]}>
                  <Ionicons name="close" size={11} color={RED} />
                </View>
                <Text style={styles.tipExampleText}>{t.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tipTagRow}>
            <View style={styles.tipTag}>
              <Ionicons name="flash-outline" size={12} color={NAVY} style={{ marginRight: 4 }} />
              <Text style={styles.tipTagText}>Present Perfect vs. Simple Past</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          {STATS.map((s, i) => (
            <View key={i} style={[styles.statItem, i < STATS.length - 1 && styles.statDivider]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Review All Button */}
        <TouchableOpacity style={styles.reviewAllBtn} activeOpacity={0.85}>
          <MaterialCommunityIcons name="book-open-variant" size={18} color={WHITE} style={{ marginRight: 8 }} />
          <Text style={styles.reviewAllText}>Review All Rules</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    height: 64,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: NAVY,
    textAlign: 'center',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_BLUE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7E3FF',
  },
  proBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: NAVY,
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
  },

  // Correction Cards
  correctionCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  correctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sayThisBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sayThisText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: TEXT_GRAY,
    letterSpacing: 0.8,
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sentenceDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  wrongText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: RED,
    textDecorationLine: 'line-through',
    lineHeight: 20,
  },
  correctText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: GREEN,
    lineHeight: 20,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  whyLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: NAVY,
  },
  whyBox: {
    backgroundColor: LIGHT_BLUE,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  whyText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: NAVY,
    lineHeight: 19,
  },

  // Contextual Tips Card
  tipCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: NAVY,
  },
  tipSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 19,
    marginBottom: 14,
  },
  tipExamples: {
    marginBottom: 14,
    gap: 8,
  },
  tipExampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipExampleText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter-Italic',
    color: TEXT_DARK,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  tipTagRow: {
    flexDirection: 'row',
  },
  tipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_BLUE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7E3FF',
  },
  tipTagText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: NAVY,
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  statValue: {
    fontSize: 26,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: TEXT_GRAY,
    letterSpacing: 0.8,
  },

  // Review All Button
  reviewAllBtn: {
    backgroundColor: NAVY,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  reviewAllText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
  },
});
