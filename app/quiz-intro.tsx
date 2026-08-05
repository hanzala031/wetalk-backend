import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#1F2937';
const TEXT_GRAY = '#6B7280';
const BG_LIGHT_BLUE = '#F1F5FE';

export default function QuizIntroScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { userAvatar } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name={"notifications-outline" as any} size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: userAvatar || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }} 
                style={styles.avatar}
              />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Hero Section */}
          <View style={styles.heroSection}>
             <View style={styles.quizIconWrapper}>
                <Ionicons name={"extension-puzzle-outline" as any} size={40} color={PRIMARY_BLUE} />
             </View>
             <Text style={styles.heroTitle}>Quiz</Text>
             <Text style={styles.heroMainTitle}>Test Your Knowledge</Text>
             <Text style={styles.heroSubtitle}>
               {"Answer a few questions to see how much you've learned so far."}
             </Text>
          </View>

          {/* Central Illustration */}
          <View style={styles.illustrationContainer}>
             <Image 
                source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779514394/233ff055-2124-4b15-96da-4466f87c8781_removalai_preview_jfxbjl.png' }}
                style={styles.illustration}
                resizeMode="contain"
             />
          </View>

          {/* Info Cards Row */}
          <View style={styles.infoRow}>
             <View style={styles.infoCard}>
                <View style={styles.infoIconWrapper}>
                   <Ionicons name="document-text-outline" size={20} color={PRIMARY_BLUE} />
                </View>
                <Text style={styles.infoValue}>5 Questions</Text>
                <Text style={styles.infoLabel}>Multiple Choices</Text>
             </View>

             <View style={styles.infoCard}>
                <View style={styles.infoIconWrapper}>
                   <Ionicons name="time-outline" size={20} color={PRIMARY_BLUE} />
                </View>
                <Text style={styles.infoValue}>5-7 min</Text>
                <Text style={styles.infoLabel}>Estimated time</Text>
             </View>

             <View style={styles.infoCard}>
                <View style={styles.infoIconWrapper}>
                   <Ionicons name="trophy-outline" size={20} color={PRIMARY_BLUE} />
                </View>
                <Text style={styles.infoValue}>Instant Result</Text>
                <Text style={styles.infoLabel}>See your score</Text>
             </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
             <TouchableOpacity 
                style={styles.startBtn}
                onPress={() => router.push({ pathname: '/quiz', params: { lessonId: lessonId } })}
             >
                <Text style={styles.startBtnText}>Start Quiz</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
             </TouchableOpacity>

             <TouchableOpacity style={styles.reviewBtn}>
                <Ionicons name="book-outline" size={20} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
                <Text style={styles.reviewBtnText}>Review lesson First</Text>
             </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: 10,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  quizIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 4,
  },
  heroMainTitle: {
    fontSize: 28,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  illustrationContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: width * 0.7,
    height: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
    backgroundColor: '#F8FAFF',
    padding: 16,
    borderRadius: 20,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  startBtn: {
    backgroundColor: PRIMARY_BLUE,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  reviewBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  reviewBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  bottomSpacer: {
    height: 40,
  },
});
