import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lessonsData from '@/data/lessons.json';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#1F2937';
const TEXT_GRAY = '#6B7280';

// --- Sub-component: Animated Wave ---
const MovingWave = ({ active }: { active: boolean }) => {
  return (
    <View style={styles.waveContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <MotiView
          key={i}
          from={{ height: 10, opacity: 0.3 }}
          animate={{ 
            height: active ? 10 + Math.random() * 30 : 10,
            opacity: active ? 0.4 + Math.random() * 0.6 : 0.3 
          }}
          transition={{
            type: 'timing',
            duration: 400,
            loop: true,
            delay: i * 100,
          }}
          style={styles.waveBar}
        />
      ))}
    </View>
  );
};

export default function SpeakYourselfScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { userAvatar, syncProgressToBackend } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  const [challenges, setChallenges] = useState<string[]>([]);
  const [lessonTitle, setLessonTitle] = useState('Lesson');

  useEffect(() => {
    const activeId = lessonId || '1';
    const allLessons = lessonsData.lessons || [];
    const currentLesson = allLessons.find(l => l.id === activeId);
    if (currentLesson) {
      setLessonTitle(currentLesson.title);
      if (currentLesson.steps.learn) {
        const sentences = currentLesson.steps.learn
          .map((item: any) => item.example)
          .filter((ex: string | undefined) => !!ex)
          .slice(0, 5);
        setChallenges(sentences);
      }
    }
  }, [lessonId]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Speak Yourself</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color={PRIMARY_BLUE} />
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
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Its your Turn!</Text>
              <Text style={styles.heroSubtitle}>Speak out loud and build confidence with every sentence.</Text>
              
              <View style={styles.stepIndicators}>
                <View style={styles.stepItem}>
                  <View style={styles.stepIconBox}>
                    <Ionicons name="mic" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepText}>Speak</Text>
                </View>
                <Ionicons name="arrow-forward" size={12} color={PRIMARY_BLUE} />
                <View style={styles.stepItem}>
                  <View style={styles.stepIconBox}>
                    <Ionicons name="happy-outline" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepText}>Improve</Text>
                </View>
                <Ionicons name="arrow-forward" size={12} color={PRIMARY_BLUE} />
                <View style={styles.stepItem}>
                  <View style={styles.stepIconBox}>
                    <Ionicons name="star" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepText}>Shine</Text>
                </View>
              </View>
            </View>
            <Image 
              source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779353676/bgkliu_ycyfnr.png' }} 
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Today Challenges */}
          <View style={styles.challengesCard}>
             <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Today challenges</Text>
                <TouchableOpacity style={styles.exampleBadge}>
                   <Ionicons name="bulb-outline" size={14} color={PRIMARY_BLUE} />
                   <Text style={styles.exampleText}>Example</Text>
                </TouchableOpacity>
             </View>
             <Text style={styles.cardSubtitle}>Practice speaking sentences about {lessonTitle.toLowerCase()}.</Text>

             <View style={styles.challengeBox}>
                {challenges.map((line, index) => (
                  <View key={index} style={styles.challengeLine}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.lineText}>{line}</Text>
                  </View>
                ))}
             </View>

             {/* Recording Section */}
             <View style={styles.recordBox}>
                <Text style={styles.recordTitle}>Record your Answer</Text>
                <View style={styles.waveformRow}>
                   <MovingWave active={isRecording} />
                   <TouchableOpacity 
                    style={[styles.micBtn, isRecording && styles.micBtnActive]} 
                    onPress={() => {
                      if (isRecording) {
                        setHasRecorded(true);
                      }
                      setIsRecording(!isRecording);
                    }}
                   >
                      <Ionicons name={isRecording ? "stop" : "mic"} size={24} color="#FFFFFF" />
                   </TouchableOpacity>
                   <MovingWave active={isRecording} />
                </View>
                <Text style={styles.tapToSpeak}>{isRecording ? "Listening..." : "Tap to Start Speaking"}</Text>
                <Text style={styles.timer}>00:00 / 01:00</Text>
             </View>
          </View>

          {/* Tips Section */}
          <View style={styles.tipsCard}>
             <Text style={styles.tipsTitle}>Record your Answer</Text>
             <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />
                <Text style={styles.tipText}>Speak clearly and at a steady pace.</Text>
             </View>
             <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />
                <Text style={styles.tipText}>Use simple and correct words.</Text>
             </View>
             <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />
                <Text style={styles.tipText}>{"Don't worry about mistakes. Just speak!"}</Text>
             </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.footer}>
           <TouchableOpacity 
             style={[styles.finishBtn, !hasRecorded && styles.finishBtnDisabled]} 
             disabled={!hasRecorded}
             onPress={async () => {
                const activeLessonId = lessonId || '1';
                try {
                  await AsyncStorage.setItem(`completed_practice_${activeLessonId}`, 'true');
                  await syncProgressToBackend();
                  router.replace({ pathname: '/lesson-details', params: { id: activeLessonId } });
                } catch (e) {
                  console.error(e);
                  router.back();
                }
              }}
           >
              <Text style={styles.finishBtnText}>
                {hasRecorded ? "Finish Practice" : "Record to Finish"}
              </Text>
           </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroCard: {
    backgroundColor: '#EBF2FF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 180,
  },
  heroContent: {
    flex: 1,
    paddingRight: 80,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 16,
    marginBottom: 16,
  },
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 9,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
  },
  heroImage: {
    width: 210,
    height: 240,
    position: 'absolute',
    right: -35,
    bottom: -20,
  },
  challengesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  exampleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exampleText: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginLeft: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    marginBottom: 20,
  },
  challengeBox: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: PRIMARY_BLUE,
    marginBottom: 24,
  },
  challengeLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    color: '#000000',
    marginRight: 8,
    fontWeight: 'bold',
  },
  lineText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#000000',
    lineHeight: 18,
  },
  recordBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginBottom: 16,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 15,
    marginBottom: 12,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    width: 60,
    justifyContent: 'center',
  },
  waveBar: {
    width: 3,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 2,
  },
  micBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  micBtnActive: {
    backgroundColor: '#DC2626',
  },
  tapToSpeak: {
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginBottom: 4,
  },
  timer: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  tipsCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginBottom: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  },
  bottomSpacer: {
    height: 40,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  finishBtn: {
    backgroundColor: PRIMARY_BLUE,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  finishBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
});
