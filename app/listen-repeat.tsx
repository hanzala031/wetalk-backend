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
  NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLessonWithFallback } from '@/lib/api-client';

const { width } = Dimensions.get('window');

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#1F2937';
const TEXT_GRAY = '#6B7280';
const SUCCESS_GREEN = '#2E7D32';
const ERROR_RED = '#DC2626';

const isVoiceNativeModuleAvailable = false;

const calculateSimilarity = (s1: string, s2: string) => {
  const clean = (s: string) => s.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim();
  const target = clean(s2);
  const spoken = clean(s1);
  if (target === spoken) return 1.0;
  const words1 = spoken.split(" ");
  const words2 = target.split(" ");
  let matches = 0;
  words1.forEach(word => { if (words2.includes(word)) matches++; });
  return matches / Math.max(words1.length, words2.length);
};

export default function ListenRepeatScreen() {
  const { word = 'Hello', lessonId } = useLocalSearchParams<{ word: string; lessonId: string }>();
  const { userName, userAvatar, syncProgressToBackend, userToken } = useAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [targetSentence, setTargetSentence] = useState("Hello! How are you?");

  useEffect(() => {
    const activeId = lessonId || '1';
    getLessonWithFallback(activeId, userToken).then((currentLesson) => {
      if (currentLesson && currentLesson.steps.practice) {
        const practiceItem = currentLesson.steps.practice.find((p: any) => p.type === 'listen_repeat');
        if (practiceItem && practiceItem.phrase) {
          setTargetSentence(practiceItem.phrase);
        }
      }
    });
  }, [lessonId, userToken]);



  const speak = () => {
    setIsSpeaking(true);
    Speech.speak(targetSentence, {
      language: 'en',
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const toggleRecording = async () => {
    if (isCorrect) return;

    if (isRecording) {
      setSpokenText(targetSentence);
      setIsCorrect(true);
      setFeedback('Perfect! You got it right.');
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setFeedback('Listening...');
    }
  };

  const handleReset = () => {
    setSpokenText('');
    setIsCorrect(false);
    setFeedback('');
    setIsRecording(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{word}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color={PRIMARY_BLUE} />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: (userAvatar && userAvatar !== 'default-avatar.png') ? userAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=004D73&color=fff` }} 
                style={styles.avatar}
              />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Hero Section */}
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Listen & Repeat</Text>
              <Text style={styles.heroSubtitle}>Listen to the audio and repeat the sentence out loud.</Text>
            </View>
            <Image 
              source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1779353676/bgkliu_ycyfnr.png' }} 
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Main Content Area */}
          <View style={styles.mainContent}>
             {/* Listen Card */}
             <View style={[styles.listenCard, styles.activityCard]}>
                <View style={styles.listenHeader}>
                   <View style={styles.listenBadge}>
                      <Text style={styles.listenBadgeText}>Listen to the Sentence</Text>
                   </View>
                </View>

                <Text style={styles.sentenceText}>{targetSentence}</Text>

                <View style={styles.waveformContainer}>
                   <View style={styles.waveBar} />
                   <View style={[styles.waveBar, { height: 30 }]} />
                   <View style={[styles.waveBar, { height: 20 }]} />
                   <View style={[styles.waveBar, { height: 40 }]} />
                   
                   <TouchableOpacity style={styles.playButton} onPress={speak}>
                      <Ionicons name="volume-high" size={28} color="#FFFFFF" />
                   </TouchableOpacity>

                   <View style={[styles.waveBar, { height: 40 }]} />
                   <View style={[styles.waveBar, { height: 20 }]} />
                   <View style={[styles.waveBar, { height: 30 }]} />
                   <View style={styles.waveBar} />
                </View>
             </View>

             {/* Your Turn Card */}
             <View style={[styles.recordCard, styles.activityCard]}>
                <View style={styles.recordBadge}>
                   <Text style={styles.recordBadgeText}>Your Turn</Text>
                </View>
                <Text style={styles.recordSubtitle}>Tap the Microphone and repeat the sentence</Text>
                
                <TouchableOpacity 
                  style={[styles.micButton, isRecording && styles.micButtonActive, isCorrect && styles.micButtonSuccess]} 
                  onPress={toggleRecording}
                  disabled={isCorrect}
                >
                   <Ionicons name={isCorrect ? "checkmark" : isRecording ? "stop" : "mic"} size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={[styles.tapText, isCorrect && { color: SUCCESS_GREEN }]}>
                  {isCorrect ? "Done!" : isRecording ? "Listening..." : "Tap to Speak"}
                </Text>

                 {spokenText !== '' && (
                  <Text style={[styles.spokenText, { color: isCorrect ? SUCCESS_GREEN : ERROR_RED }]}>
                    {`"${spokenText}"`}
                  </Text>
                )}
                {feedback !== '' && (
                  <Text style={[styles.feedbackText, { color: isCorrect ? SUCCESS_GREEN : ERROR_RED }]}>
                    {feedback}
                  </Text>
                )}
             </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.footer}>
           <TouchableOpacity style={styles.backBtn} onPress={handleReset}>
              <Text style={styles.backBtnText}>Practice Again</Text>
           </TouchableOpacity>
           <TouchableOpacity 
              style={[styles.nextBtn, !isCorrect && styles.nextBtnDisabled]} 
              disabled={!isCorrect}
              onPress={async () => {
                try {
                  await AsyncStorage.setItem(`completed_listen_repeat_${lessonId}`, 'true');
                  await syncProgressToBackend();
                } catch (e) {
                  console.error(e);
                }
                router.back();
              }}
           >
              <Text style={styles.nextBtnText}>Continue to Next</Text>
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
    minWidth: 70,
    alignItems: 'flex-start',
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
    justifyContent: 'flex-end',
    minWidth: 70,
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
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    flex: 1,
    paddingRight: 80,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 18,
  },
  heroImage: {
    width: 140,
    height: 160,
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  mainContent: {
    gap: 16,
  },
  activityCard: {
    minHeight: 280,
    justifyContent: 'center',
  },
  listenCard: {
    backgroundColor: '#F1F5FE',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listenHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  listenBadge: {
    backgroundColor: '#004D73',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  listenBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  sentenceText: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    textAlign: 'center',
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  waveBar: {
    width: 3,
    height: 15,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordCard: {
    backgroundColor: '#F1F5FE',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recordBadge: {
    backgroundColor: '#004D73',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  recordBadgeText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  recordSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    marginBottom: 20,
    textAlign: 'center',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  micButtonActive: {
    backgroundColor: ERROR_RED,
  },
  micButtonSuccess: {
    backgroundColor: SUCCESS_GREEN,
  },
  tapText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: PRIMARY_BLUE,
    marginBottom: 8,
  },
  spokenText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
  },
  nextBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.7,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
});
