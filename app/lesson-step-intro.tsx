import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const NAVY_BLUE = '#00334E';

const STEP_CONFIG = [
  {
    title: 'Word Practice',
    description: 'Learn and practice new words related to workplace.',
    icon: 'book-outline',
    color: '#E8F5E9',
    iconColor: '#2E7D32',
    questions: 10,
    time: '3-5 min'
  },
  {
    title: 'Listen & Choose',
    description: 'Listen to the audio and choose the correct answer.',
    icon: 'headset-outline',
    color: '#E3F2FD',
    iconColor: '#1565C0',
    questions: 8,
    time: '3-5 min'
  },
  {
    title: 'Fill in the Blanks',
    description: 'Complete the sentences with the correct words.',
    icon: 'chatbubble-ellipses-outline',
    color: '#F3E5F5',
    iconColor: '#7B1FA2',
    questions: 10,
    time: '3-5 min'
  },
  {
    title: 'Sentence Builder',
    description: 'Rearrange the words to make correct sentences.',
    icon: 'pencil-outline',
    color: '#FFF8E1',
    iconColor: '#F9A825',
    questions: 8,
    time: '3-5 min'
  },
  {
    title: 'Speak Practice',
    description: 'Practice speaking and improve your pronunciation.',
    icon: 'mic-outline',
    color: '#FFEBEE',
    iconColor: '#C62828',
    questions: 5,
    time: '3-5 min'
  }
];

export default function LessonStepIntroScreen() {
  const { lessonId, stepIndex } = useLocalSearchParams<{ lessonId: string, stepIndex: string }>();
  const index = parseInt(stepIndex || '0');
  const config = STEP_CONFIG[index];

  const handleStart = () => {
    router.push({
      pathname: '/lesson-player',
      params: { lessonId, startStep: index }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={NAVY_BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step {index + 1}</Text>
        <View style={styles.headerRight}>
           <Ionicons name="flash" size={24} color="#38BDF8" />
           <Text style={styles.energyText}>5</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Main Icon Card */}
        <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={60} color={config.iconColor} />
        </View>

        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="disc-outline" size={24} color="#64748B" />
            </View>
            <View>
              <Text style={styles.statValue}>{config.questions}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="time-outline" size={24} color="#64748B" />
            </View>
            <View>
              <Text style={styles.statValue}>{config.time}</Text>
              <Text style={styles.statLabel}>min</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
    minWidth: 50,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 50,
    gap: 4,
  },
  energyText: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#38BDF8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 50,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: NAVY_BLUE,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: 'Nunito-SemiBold',
    letterSpacing: 0.5,
  },
});
