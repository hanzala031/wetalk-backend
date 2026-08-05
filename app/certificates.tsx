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
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, authConfig, isNetworkError, logApiError } from '@/lib/api-client';

const { width } = Dimensions.get('window');

// Colors from the image
const BACKGROUND_COLOR = '#FFFFFF';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const ACCENT_BLUE = '#004D73'; 
 // Dark navy for the academic profile card
const CARD_BG = '#FFFFFF';
const BORDER_COLOR = '#F3F4F6';

export default function CertificatesScreen() {
  const { userName, userToken, userAvatar } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      if (!userToken) {
        setProgressData({});
        setLoading(false);
        return;
      }
      const res = await apiClient.get('/user/sync', authConfig(userToken, { timeout: 10000 }));
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

  // Derive certificates from completed lessons (backend has no certificates array)
  // A certificate is awarded for every 5 completed lessons
  const completedLessonsCount = (() => {
    try {
      const raw = progressData?.['completed_lessons'];
      if (!raw) return 0;
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(arr) ? arr.length : 0;
    } catch { return 0; }
  })();
  const certificates = completedLessonsCount >= 5
    ? [{ title: 'English Beginner Certificate', date: 'Recently' }]
    : [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>English Master</Text>
        <TouchableOpacity style={styles.headerButton}>
          {userAvatar ? (
             <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          ) : (
             <Ionicons name="person-circle-outline" size={32} color="#D1D5DB" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Academic Profile Card */}
        <View style={styles.academicCard}>
          <Text style={styles.academicLabel}>Academic Profile</Text>
          <Text style={styles.academicName}>{userName || 'User'}</Text>
          <View style={styles.earnedRow}>
            <Ionicons name="star-outline" size={18} color="#FFFFFF" />
            <Text style={styles.earnedText}>{certificates.length} Certificates Earned</Text>
          </View>
        </View>

        {/* Your Achievements List */}
        <Text style={styles.sectionTitle}>Your Achievements</Text>
        <View style={styles.certificateList}>
          {certificates.map((cert: any, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={styles.certCard}
              onPress={() => router.push({ pathname: '/certificate-details', params: { title: cert.title } })}
            >
              <View style={styles.certIconContainer}>
                <Ionicons name="school-outline" size={24} color={ACCENT_BLUE} />
              </View>
              <View style={styles.certInfo}>
                <Text style={styles.certTitle}>{cert.title}</Text>
                <Text style={styles.certDate}>Issued: {cert.date || 'Recently'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
          {certificates.length === 0 && (
            <Text style={{ textAlign: 'center', color: TEXT_SECONDARY, marginTop: 20 }}>No certificates earned yet.</Text>
          )}
        </View>

        {/* Highlight Cards */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightIconCircle}>
            <MaterialCommunityIcons name="medal-outline" size={24} color={ACCENT_BLUE} />
          </View>
          <Text style={styles.highlightTitle}>Top 5% of Learners</Text>
          <Text style={styles.highlightDesc}>
            Your consistent study streak puts you in the elite category this month.
          </Text>
        </View>

        <View style={styles.highlightCard}>
          <View style={styles.highlightIconCircle}>
            <Ionicons name="flag-outline" size={22} color={ACCENT_BLUE} />
          </View>
          <Text style={styles.highlightTitle}>Next Target</Text>
          <Text style={styles.highlightDesc}>
            Complete 3 more Business English units to unlock the Professional Diploma.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  academicCard: {
    backgroundColor: ACCENT_BLUE,
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  academicLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#94A3B8',
    marginBottom: 4,
  },
  academicName: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  earnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earnedText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 15,
  },
  certificateList: {
    gap: 12,
    marginBottom: 30,
  },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  certIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  certInfo: {
    flex: 1,
  },
  certTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  certDate: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
  },
  highlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  highlightIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  highlightDesc: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
});
