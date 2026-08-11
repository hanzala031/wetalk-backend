import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Color Palette
const WHITE = '#FFFFFF';
const BG = '#F8FAFC';
const TEXT_DARK = '#1C2B4A';
const TEXT_GRAY = '#6B7280';
const GOLD = '#E8B84B';
const NAVY = '#0B2D64';
const SUCCESS_GREEN = '#10B981';
const BORDER_COLOR = '#E2E8F0';

export default function CertificateDetailsScreen() {
  const { userName } = useAuth();
  const displayName = userName || 'Hanzala';

  const params = useLocalSearchParams<{
    title?: string;
    completionDate?: string;
    lessons?: string;
    certId?: string;
  }>();

  const title = params.title || 'Beginner English';
  const completionDate = params.completionDate || '25 July 2026';
  const lessons = params.lessons || '5 / 5';
  const certId = params.certId || 'WT-2026-0001';

  // Dynamic Course Details
  const getAboutText = (courseTitle: string) => {
    if (courseTitle.includes('Intermediate')) {
      return 'This Intermediate English course is designed to expand your English language skills, focusing on complex grammar, conversation fluidity, and advanced vocabulary.';
    } else if (courseTitle.includes('Advanced')) {
      return 'This Advanced English course focuses on mastering academic, business, and fluent English speaking, writing, reading, and listening skills.';
    }
    return 'This Beginner English course is designed to build a strong foundation in English language skills including vocabulary, grammar, reading, writing and speaking.';
  };

  const getSkillsGained = (courseTitle: string) => {
    if (courseTitle.includes('Intermediate')) {
      return [
        'Intermediate Grammar & Tenses',
        'Conversational Fluidity',
        'Idiomatic Expressions',
        'Active Listening Skills',
        'Business Communication'
      ];
    } else if (courseTitle.includes('Advanced')) {
      return [
        'Advanced Rhetoric & Writing',
        'Nuanced Vocabulary',
        'Academic & Professional Speaking',
        'Complex Text Synthesis',
        'Native-like Accent & Intonation'
      ];
    }
    return [
      'Basic English Grammar',
      'Common Vocabulary',
      'Reading Comprehension',
      'Everyday Conversations',
      'Sentence Formation'
    ];
  };

  const skills = getSkillsGained(title);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificate Details</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => alert('Download PDF started...')}>
          <Ionicons name="download-outline" size={24} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Certificate Display Container */}
        <View style={styles.certCardWrapper}>
          <View style={styles.certOuterFrame}>
            <View style={styles.certInnerFrame}>
              


              {/* WaTalk Logo */}
              <Image
                source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779343073/Gemini_Generated_Image_o0gghoo0gghoo0gg_wq3guy.png' }}
                style={styles.certLogo}
                resizeMode="contain"
              />

              {/* Text Layout */}
              <Text style={styles.certTitleText}>Certificate of Completion</Text>
              <Text style={styles.certSubText}>This certificate is proudly presented to</Text>
              
              <Text style={styles.recipientName}>{displayName}</Text>
              <View style={styles.nameUnderline} />

              <Text style={styles.courseCompleteText}>
                for successfully completing the English learning course.
              </Text>

              {/* Footer Row (Signatures & Badge) */}
              <View style={styles.certFooter}>
                <View style={styles.sigContainer}>
                  <Text style={styles.sigFont}>John</Text>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigLabel}>Instructor</Text>
                </View>

                <View style={styles.goldMedalContainer}>
                  <MaterialCommunityIcons name="medal" size={24} color={GOLD} />
                </View>

                <View style={styles.sigContainer}>
                  <Text style={styles.sigFont}>Austin</Text>
                  <View style={styles.sigLine} />
                  <Text style={styles.sigLabel}>Director</Text>
                </View>
              </View>

            </View>
          </View>
        </View>

        {/* Certificate ID Label */}
        <Text style={styles.certIdLabel}>Certificate ID: {certId}</Text>

        {/* Dynamic 4-Column Stats Grid Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            
            <View style={styles.statCol}>
              <View style={styles.statIconBox}>
                <Ionicons name="school" size={18} color={WHITE} />
              </View>
              <View style={styles.statLabelContainer}>
                <Text style={styles.statTitle}>Course</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue} numberOfLines={2}>{title}</Text>
              </View>
            </View>

            <View style={[styles.statCol, styles.statDivider]}>
              <View style={styles.statIconBox}>
                <Ionicons name="calendar" size={18} color={WHITE} />
              </View>
              <View style={styles.statLabelContainer}>
                <Text style={styles.statTitle}>Completion Date</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue} numberOfLines={2}>{completionDate}</Text>
              </View>
            </View>

            <View style={[styles.statCol, styles.statDivider]}>
              <View style={styles.statIconBox}>
                <Ionicons name="book" size={18} color={WHITE} />
              </View>
              <View style={styles.statLabelContainer}>
                <Text style={styles.statTitle}>Lessons Completed</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{lessons}</Text>
              </View>
            </View>

            <View style={[styles.statCol, styles.statDivider]}>
              <View style={styles.statIconBox}>
                <Ionicons name="shield-checkmark" size={18} color={WHITE} />
              </View>
              <View style={styles.statLabelContainer}>
                <Text style={styles.statTitle}>Status</Text>
              </View>
              <View style={styles.statValueContainer}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Completed</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

        {/* About This Course Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIconBox}>
              <Ionicons name="document-text" size={18} color={WHITE} />
            </View>
            <Text style={styles.cardHeaderTitle}>About This Course</Text>
          </View>
          <Text style={styles.aboutText}>{getAboutText(title)}</Text>
        </View>

        {/* Skills You Gained Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIconBox}>
              <Ionicons name="trophy" size={18} color={WHITE} />
            </View>
            <Text style={styles.cardHeaderTitle}>Skills You Gained</Text>
          </View>

          <View style={styles.skillsSplitContainer}>
            <View style={styles.skillsList}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillRow}>
                  <Ionicons name="checkmark-sharp" size={16} color={SUCCESS_GREEN} style={styles.checkmarkIcon} />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
            <View style={styles.skillsWatermark}>
              <MaterialCommunityIcons name="certificate" size={75} color="#E2E8F0" style={{ opacity: 0.45 }} />
            </View>
          </View>
        </View>

        {/* Official Banner strip */}
        <View style={styles.infoStrip}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#475569" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            This is an official certificate issued by WaTalk English Learning. You can verify this certificate using the Certificate ID.
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={() => alert('Sharing Certificate...')}>
          <Feather name="share-2" size={18} color={WHITE} />
          <Text style={styles.shareBtnText}>Share Certificate</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 14,
    backgroundColor: WHITE,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_COLOR,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
  },
  scroll: {
    paddingBottom: 30,
  },
  certCardWrapper: {
    width: width - 32,
    alignSelf: 'center',
    marginTop: 20,
    aspectRatio: 1.45,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: NAVY,
    backgroundColor: WHITE,
    padding: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  certOuterFrame: {
    flex: 1,
    padding: 2,
    backgroundColor: WHITE,
  },
  certInnerFrame: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  ribbonPosition: {
    position: 'absolute',
    top: 0,
    right: 14,
    zIndex: 10,
  },
  certLogo: {
    width: 130,
    height: 38,
    marginTop: 2,
  },
  certTitleText: {
    fontSize: 12,
    fontFamily: 'Nunito-ExtraBold',
    color: NAVY,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  certSubText: {
    fontSize: 7.5,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
    marginTop: 1,
    textAlign: 'center',
  },
  recipientName: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
    textAlign: 'center',
    marginTop: 2,
  },
  nameUnderline: {
    width: '55%',
    height: 1.5,
    backgroundColor: GOLD,
    alignSelf: 'center',
    marginTop: 1,
  },
  courseCompleteText: {
    fontSize: 7.5,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
    textAlign: 'center',
    marginTop: 3,
  },
  certFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  sigContainer: {
    alignItems: 'center',
    width: 65,
  },
  sigFont: {
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    fontSize: 14,
    fontStyle: 'italic',
    color: NAVY,
    marginBottom: -4,
  },
  sigLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#CBD5E1',
    marginBottom: 2,
  },
  sigLabel: {
    fontSize: 7,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
  },
  goldMedalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  certIdLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  statLabelContainer: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValueContainer: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#E4E9F2',
    ...Platform.select({
      ios: {
        shadowColor: '#9BA5C4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  statsCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#E4E9F2',
    ...Platform.select({
      ios: {
        shadowColor: '#9BA5C4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  statDivider: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#E2E8F0',
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 10,
    fontFamily: 'Nunito-SemiBold',
    color: TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
    textAlign: 'center',
  },
  statusBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  statusBadgeText: {
    color: '#137333',
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
  },
  aboutText: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
    lineHeight: 20,
  },
  skillsSplitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillsList: {
    flex: 1,
    gap: 8,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmarkIcon: {
    marginRight: 8,
  },
  skillText: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
  },
  skillsWatermark: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Nunito-Regular',
    color: '#475569',
    lineHeight: 16,
  },
  shareBtn: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: NAVY,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 16,
  },
  shareBtnText: {
    color: WHITE,
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
  },
});
