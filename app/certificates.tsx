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
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError, logApiError } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const NAVY = '#1A3A6B';
const NAVY_DARK = '#0F2557';
const WHITE = '#FFFFFF';
const BG = '#F5F6FA';
const TEXT_GRAY = '#7B8FA1';
const TEXT_DARK = '#1C2B4A';
const CERT_BLUE = '#1A3A6B';
const GOLD = '#E8B84B';

// ─── Mini Certificate Preview (Landscape & Full Width) ───────────────────────
function MiniCertificate({ name, isLocked }: { name: string; isLocked?: boolean }) {
  return (
    <View style={[miniStyles.wrapper, isLocked && { borderColor: '#94A3B8' }]}>
      <View style={miniStyles.outerFrame}>
        <View style={[miniStyles.innerFrame, isLocked && { borderColor: '#94A3B8' }]}>
          {/* Logo / Header */}
          <Image
            source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779343073/Gemini_Generated_Image_o0gghoo0gghoo0gg_wq3guy.png' }}
            style={[miniStyles.logoImage, isLocked && { tintColor: '#94A3B8', opacity: 0.5 }]}
            resizeMode="contain"
          />

          {/* CERTIFICATE OF COMPLETION */}
          <View style={{ alignItems: 'center' }}>
            <Text style={[miniStyles.certLabel, { color: isLocked ? '#94A3B8' : CERT_BLUE }]}>
              Certificate of Completion
            </Text>
            <Text style={miniStyles.certSubLabel}>This certificate is proudly presented to</Text>
          </View>

          {/* Recipient Name */}
          <Text style={[miniStyles.recipientName, { color: isLocked ? '#64748B' : TEXT_DARK }]} numberOfLines={1}>
            {name}
          </Text>

          {/* Separator line */}
          <View style={[miniStyles.underline, { backgroundColor: isLocked ? '#CBD5E1' : GOLD }]} />

          {/* Description */}
          <Text style={miniStyles.certDescription}>for successfully completing the English learning course.</Text>

          {/* Footer with ribbon & signature lines */}
          <View style={miniStyles.certFooter}>
            <View style={miniStyles.signatureLine}>
              <View style={[miniStyles.line, isLocked && { backgroundColor: '#CBD5E1' }]} />
              <Text style={miniStyles.signatureText}>Instructor</Text>
            </View>

            <View style={miniStyles.ribbonBadge}>
              <MaterialCommunityIcons name="medal" size={18} color={isLocked ? '#94A3B8' : GOLD} />
            </View>

            <View style={miniStyles.signatureLine}>
              <View style={[miniStyles.line, isLocked && { backgroundColor: '#CBD5E1' }]} />
              <Text style={miniStyles.signatureText}>Director</Text>
            </View>
          </View>
        </View>
      </View>
      {isLocked && (
        <View style={miniStyles.lockOverlay}>
          <Feather name="lock" size={26} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    aspectRatio: 1.45,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: CERT_BLUE,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  outerFrame: {
    flex: 1,
    padding: 6,
    backgroundColor: WHITE,
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: CERT_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoImage: {
    width: 120,
    height: 35,
    marginTop: 2,
  },
  certLabel: {
    fontSize: 10.5,
    fontFamily: 'Nunito-ExtraBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  certSubLabel: {
    fontSize: 7.5,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
    marginTop: 2,
    textAlign: 'center',
  },
  recipientName: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
    marginVertical: 1,
  },
  underline: {
    width: '60%',
    height: 1.5,
    marginVertical: 1,
  },
  certDescription: {
    fontSize: 7.5,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
    textAlign: 'center',
  },
  certFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  signatureLine: {
    alignItems: 'center',
    width: 60,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: CERT_BLUE,
    opacity: 0.4,
    marginBottom: 2,
  },
  signatureText: {
    fontSize: 7,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
  },
  ribbonBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function CertificatesScreen() {
  const { userName, userToken } = useAuth();
  const displayName = userName || 'Austin Ross';

  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  type TabType = 'All Certificates' | 'Completed' | 'In Progress';
  const [activeTab, setActiveTab] = useState<TabType>('All Certificates');

  const fetchData = async () => {
    try {
      if (!userToken) {
        setProgressData({});
        setLoading(false);
        return;
      }
      const res = await apiClient.get('/user/sync', authConfig(userToken, { timeout: 3000 }));
      if (res.data?.success) setProgressData(res.data.progressData || {});
      else setProgressData({});
    } catch (error) {
      if (!isNetworkError(error)) {
        logApiError('Error fetching certificates', error);
      }
      setProgressData({});
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [userToken])
  );

  // Derive dynamic stats from completed lessons
  const completedLessons = (() => {
    try {
      const raw = progressData?.['completed_lessons'];
      if (!raw) return [];
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(arr) ? arr.map(Number) : [];
    } catch {
      return [];
    }
  })();

  const getCompletionDate = (lessonIds: number[]) => {
    try {
      const dates = lessonIds
        .map(id => progressData?.[`completion_date_${id}`])
        .filter(Boolean)
        .map(d => new Date(d));
      if (dates.length === 0) return '—';
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      return maxDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  // 1. Beginner English: Lessons 1-5
  const beginnerCompletedCount = completedLessons.filter(l => l >= 1 && l <= 5).length;
  const isBeginnerCompleted = beginnerCompletedCount === 5;

  // 2. Intermediate English: Lessons 6-10
  const intermediateCompletedCount = completedLessons.filter(l => l >= 6 && l <= 10).length;
  const isIntermediateCompleted = intermediateCompletedCount === 5;

  // 3. Advanced English: Lessons 11-15
  const advancedCompletedCount = completedLessons.filter(l => l >= 11 && l <= 15).length;
  const isAdvancedCompleted = advancedCompletedCount === 5;

  const certificates = [
    {
      id: '1',
      title: 'Beginner English',
      isLocked: false,
      status: isBeginnerCompleted ? ('completed' as const) : ('in_progress' as const),
      completionDate: isBeginnerCompleted ? getCompletionDate([1, 2, 3, 4, 5]) : '—',
      lessons: `${beginnerCompletedCount} / 5`,
      certId: isBeginnerCompleted ? 'WT-2026-0001' : '—'
    },
    {
      id: '2',
      title: 'Intermediate English',
      isLocked: !isBeginnerCompleted,
      status: isIntermediateCompleted ? ('completed' as const) : (isBeginnerCompleted ? ('in_progress' as const) : ('locked' as const)),
      completionDate: isIntermediateCompleted ? getCompletionDate([6, 7, 8, 9, 10]) : '—',
      lessons: `${intermediateCompletedCount} / 5`,
      certId: isIntermediateCompleted ? 'WT-2026-0002' : '—'
    },
    {
      id: '3',
      title: 'Advanced English',
      isLocked: !isIntermediateCompleted,
      status: isAdvancedCompleted ? ('completed' as const) : (isIntermediateCompleted ? ('in_progress' as const) : ('locked' as const)),
      completionDate: isAdvancedCompleted ? getCompletionDate([11, 12, 13, 14, 15]) : '—',
      lessons: `${advancedCompletedCount} / 5`,
      certId: isAdvancedCompleted ? 'WT-2026-0003' : '—'
    }
  ];

  const filtered = certificates.filter((c) => {
    if (activeTab === 'All Certificates') return true;
    if (activeTab === 'Completed') return c.status === 'completed';
    if (activeTab === 'In Progress') return c.status === 'in_progress' || c.status === 'locked';
    return true;
  });

  const tabs: TabType[] = ['All Certificates', 'Completed', 'In Progress'];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Certificates</Text>
          <View style={styles.headerIcon} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
          <Text style={{ fontFamily: 'Nunito-Bold', color: TEXT_DARK, fontSize: 16 }}>Loading Certificates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Certificates</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>Great Progress</Text>
            <Text style={styles.bannerSubtitle}>
              Keep Learning and Earn{'\n'}more Certificates
            </Text>
          </View>
          <View style={styles.bannerRight}>
            <View style={styles.bannerIconBox}>
              <View style={styles.bannerCertOutline}>
                <MaterialCommunityIcons name="certificate-outline" size={36} color={WHITE} />
              </View>
              <View style={styles.bannerRibbonBadge}>
                <MaterialCommunityIcons name="medal" size={14} color={GOLD} />
              </View>
            </View>
          </View>
        </View>

        {/* Tab Filters */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Certificate Cards */}
        <View style={styles.cardList}>
          {filtered.map((cert) => (
            <View 
              key={cert.id} 
              style={[styles.certCard, cert.isLocked && styles.certCardLocked]}
            >
              
              {/* Full width landscape certificate preview on top */}
              <MiniCertificate name={displayName} isLocked={cert.isLocked} />
              
              {/* Card Header Row (Title & Tag below preview) */}
              <View style={styles.certCardHeader}>
                <View style={styles.certTitleContainer}>
                  <Text style={[styles.certLessonTitle, cert.isLocked && styles.textLocked]}>{cert.title}</Text>
                  
                  {!cert.isLocked && cert.status === 'completed' && (
                    <View style={styles.completedTag}>
                      <Text style={styles.completedTagText}>Completed</Text>
                    </View>
                  )}
                  
                  {!cert.isLocked && cert.status === 'in_progress' && (
                    <View style={styles.progressTag}>
                      <Text style={styles.progressTagText}>In Progress</Text>
                    </View>
                  )}

                  {cert.isLocked && (
                    <View style={styles.lockedTag}>
                      <Text style={styles.lockedTagText}>Locked</Text>
                    </View>
                  )}
                </View>

                {!cert.isLocked ? (
                  <TouchableOpacity onPress={() => router.push({
                    pathname: '/certificate-details',
                    params: {
                      title: cert.title,
                      completionDate: cert.completionDate,
                      lessons: cert.lessons,
                      certId: cert.certId
                    }
                  })}>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                ) : (
                  <Feather name="lock" size={16} color="#94A3B8" style={{ marginRight: 2 }} />
                )}
              </View>

              {/* Card Body Details */}
              <View style={[styles.certDetails, cert.isLocked && styles.certDetailsLocked]}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={cert.isLocked ? '#CBD5E1' : TEXT_GRAY} />
                  <Text style={[styles.detailLabel, cert.isLocked && styles.textLocked]}>Completion Date</Text>
                  <Text style={[styles.detailValue, cert.isLocked && styles.textLocked]}>{cert.completionDate}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="book-outline" size={16} color={cert.isLocked ? '#CBD5E1' : TEXT_GRAY} />
                  <Text style={[styles.detailLabel, cert.isLocked && styles.textLocked]}>Lessons</Text>
                  <Text style={[styles.detailValue, cert.isLocked && styles.textLocked]}>{cert.lessons}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={cert.isLocked ? '#CBD5E1' : TEXT_GRAY} />
                  <Text style={[styles.detailLabel, cert.isLocked && styles.textLocked]}>Certificate ID</Text>
                  <Text style={[styles.detailValue, cert.isLocked && styles.textLocked]}>{cert.certId}</Text>
                </View>

                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    disabled={cert.isLocked || cert.status !== 'completed'}
                    style={[styles.outlineBtn, (cert.isLocked || cert.status !== 'completed') && styles.outlineBtnLocked]}
                    onPress={() => router.push({
                      pathname: '/certificate-details',
                      params: {
                        title: cert.title,
                        completionDate: cert.completionDate,
                        lessons: cert.lessons,
                        certId: cert.certId
                      }
                    })}
                  >
                    <Text style={[styles.outlineBtnText, (cert.isLocked || cert.status !== 'completed') && styles.btnTextLocked]}>
                      View Certificate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={cert.isLocked || cert.status !== 'completed'}
                    style={[styles.solidBtn, (cert.isLocked || cert.status !== 'completed') && styles.solidBtnLocked]}
                    onPress={() => alert('Download PDF started...')}
                  >
                    <Text style={[styles.solidBtnText, (cert.isLocked || cert.status !== 'completed') && styles.btnTextLocked]}>
                      Download PDF
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          ))}
        </View>
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
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 14,
    backgroundColor: WHITE,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E4E7ED',
  },
  headerIcon: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
    letterSpacing: 0.2,
  },
  scroll: {
    paddingBottom: 40,
  },
  bannerCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 18,
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: NAVY_DARK,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  bannerLeft: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: WHITE,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 20,
  },
  bannerRight: {
    marginLeft: 16,
  },
  bannerIconBox: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
  },
  bannerCertOutline: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerRibbonBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: NAVY_DARK,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: GOLD,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 99,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#DDE3EF',
  },
  tabPillActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Nunito-SemiBold',
    color: TEXT_GRAY,
  },
  tabTextActive: {
    color: WHITE,
  },
  cardList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  certCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E4E9F2',
    ...Platform.select({
      ios: {
        shadowColor: '#9BA5C4',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  certCardLocked: {
    opacity: 0.65,
    backgroundColor: '#FAFBFD',
  },
  certCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  certTitleContainer: {
    flex: 1,
    marginLeft: 0,
  },
  certLessonTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
  },
  completedTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  completedTagText: {
    color: '#059669',
    fontSize: 11,
    fontFamily: 'Nunito-SemiBold',
  },
  progressTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  progressTagText: {
    color: '#D97706',
    fontSize: 11,
    fontFamily: 'Nunito-SemiBold',
  },
  lockedTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  lockedTagText: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: 'Nunito-SemiBold',
  },
  certDetails: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  certDetailsLocked: {
    borderTopColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: TEXT_GRAY,
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
  },
  textLocked: {
    color: '#94A3B8',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 12,
  },
  outlineBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnLocked: {
    borderColor: '#CBD5E1',
  },
  outlineBtnText: {
    color: NAVY,
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
  },
  solidBtn: {
    flex: 1,
    height: 38,
    backgroundColor: NAVY,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidBtnLocked: {
    backgroundColor: '#E2E8F0',
  },
  solidBtnText: {
    color: WHITE,
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
  },
  btnTextLocked: {
    color: '#94A3B8',
  },
});
