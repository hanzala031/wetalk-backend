import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { apiClient } from '@/lib/api-client';
import { tutorStore } from '@/lib/tutor-store';

const { width } = Dimensions.get('window');

const NAVY_BLUE = '#004D73';
const TEXT_DARK = '#0F172A';
const TEXT_GRAY = '#64748B';
const BG_COLOR = '#F8FAFC';
const WHITE = '#FFFFFF';

const TUTOR_IMAGE = 'https://res.cloudinary.com/dgedsmawq/image/upload/v1782211315/4ebc3ff2-bfbe-4a36-87f5-fbabf837a404_tjihlz.png';
const ROBOT_IMAGE = 'https://res.cloudinary.com/dgedsmawq/image/upload/v1780390838/ca3613dd317f71434f3c6d88a47de913c6b91bf2_lybs0e.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function UnlimitedTalk() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  // Robot eye blink animation
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    };
    const interval = setInterval(blink, 2000);
    return () => clearInterval(interval);
  }, [blinkAnim]);

  // Live indicator pulsing animation
  const livePulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulseAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(livePulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [livePulseAnim]);

  const [selectedTutor, setSelectedTutor] = useState(tutorStore.getTutor());

  useEffect(() => {
    setSelectedTutor(tutorStore.getTutor());
    return tutorStore.subscribe((newTutor) => {
      setSelectedTutor(newTutor);
    });
  }, []);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI tutor.\nHow can I help you today?",
      sender: 'ai',
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'I want to improve my speaking skills.',
      sender: 'user',
      timestamp: '10:31 AM',
    },
    {
      id: '3',
      text: "Great! Let's start with a small conversation. What do you like to do in your free time?",
      sender: 'ai',
      timestamp: '10:31 AM',
    },
  ]);

  const getFormattedTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMsgText,
      sender: 'user',
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await apiClient.post('/chat', { message: userMsgText });
      const data = response.data;
      const aiMsgText =
        data.reply || 'I am here to practice English with you! Let me know how I can help.';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiMsgText,
        sender: 'ai',
        timestamp: getFormattedTime(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (isSpeakerOn) {
        Speech.stop();
        Speech.speak(aiMsgText, { language: 'en-US' });
      }
    } catch (error: any) {
      setTimeout(() => {
        const fallbacks = [
          "That sounds wonderful! Could you describe it in more detail to practice your vocabulary?",
          "I understand. Let's try to focus on sentence structure. Try using different verbs!",
          'Great job! Keep expressing your ideas. What else would you like to talk about?',
        ];
        const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: randomFallback,
          sender: 'ai',
          timestamp: getFormattedTime(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (isSpeakerOn) {
          Speech.stop();
          Speech.speak(randomFallback, { language: 'en-US' });
        }
      }, 1000);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    if (isUser) {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userBubble}>
            <Text style={styles.userMessageText}>{item.text}</Text>
            <View style={styles.userMeta}>
              <Text style={styles.userTimestamp}>{item.timestamp}</Text>
              <Ionicons name="checkmark-done" size={14} color="#93C5FD" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.aiMessageContainer}>
        {/* Robot avatar */}
        <View style={styles.aiAvatarContainer}>
          <Image
            source={{ uri: ROBOT_IMAGE }}
            style={styles.robotAvatarImg}
            contentFit="contain"
          />
        </View>
        <View style={styles.aiBubble}>
          <Text style={styles.aiMessageText}>{item.text}</Text>
          <Text style={styles.aiTimestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={NAVY_BLUE} />
          </TouchableOpacity>
          <Image
            source={{ uri: ROBOT_IMAGE }}
            style={styles.headerRobotImg}
            contentFit="contain"
          />
          <Text style={styles.headerTitle}>AI Tutor</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.changeTutorBtn} 
            activeOpacity={0.8}
            onPress={() => router.push('/change-tutor')}
          >
            <Ionicons name="person-outline" size={13} color={NAVY_BLUE} style={{ marginRight: 4 }} />
            <Text style={styles.changeTutorText}>Change Tutor</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatListContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.topSection}>

              {/* ── Video Card Wrapper (for overlap effect) ── */}
              <View style={styles.videoWrapper}>
                {/* Video Card */}
                <View style={[styles.videoCard, isVideoExpanded && styles.videoCardExpanded]}>
                  {isCameraOn ? (
                    <Image
                      source={{ uri: selectedTutor.image }}
                      style={styles.tutorVideo}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.cameraOffPlaceholder}>
                      <Ionicons name="videocam-off-outline" size={48} color={WHITE} />
                      <Text style={styles.cameraOffText}>Camera is Off</Text>
                    </View>
                  )}

                  {/* LIVE Badge */}
                  <View style={styles.liveBadge}>
                    <Animated.View style={[styles.liveDot, { opacity: livePulseAnim }]} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>

                  {/* Expand Button */}
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setIsVideoExpanded(!isVideoExpanded)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={isVideoExpanded ? 'contract' : 'expand'} size={14} color={WHITE} />
                  </TouchableOpacity>
                </View>

                {/* ── Control Bar (overlapping bottom of video) ── */}
                <View style={styles.controlBar}>
                  {/* Speaker */}
                  <TouchableOpacity
                    style={styles.controlItem}
                    onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.controlCircle, !isSpeakerOn && styles.controlCircleDisabled]}>
                      <Ionicons
                        name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
                        size={20}
                        color={isSpeakerOn ? WHITE : NAVY_BLUE}
                      />
                    </View>
                    <Text style={styles.controlLabel}>Speaker</Text>
                  </TouchableOpacity>

                  {/* Mic */}
                  <TouchableOpacity
                    style={styles.controlItem}
                    onPress={() => setIsMicOn(!isMicOn)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.controlCircle, !isMicOn && styles.controlCircleDisabled]}>
                      <Ionicons
                        name={isMicOn ? 'mic' : 'mic-off'}
                        size={20}
                        color={isMicOn ? WHITE : NAVY_BLUE}
                      />
                    </View>
                    <Text style={styles.controlLabel}>Mic</Text>
                  </TouchableOpacity>

                  {/* Camera */}
                  <TouchableOpacity
                    style={styles.controlItem}
                    onPress={() => setIsCameraOn(!isCameraOn)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.controlCircle, !isCameraOn && styles.controlCircleDisabled]}>
                      <Ionicons
                        name={isCameraOn ? 'videocam' : 'videocam-off'}
                        size={20}
                        color={isCameraOn ? WHITE : NAVY_BLUE}
                      />
                    </View>
                    <Text style={styles.controlLabel}>Camera</Text>
                  </TouchableOpacity>

                  {/* End Call */}
                  <TouchableOpacity
                    style={styles.controlItem}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.controlCircle, styles.controlCircleEnd]}>
                      <Ionicons name="call" size={20} color={WHITE} style={{ transform: [{ rotate: '135deg' }] }} />
                    </View>
                    <Text style={styles.controlLabel}>End</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Info Panel ── */}
              <View style={styles.infoPanel}>
                <View style={styles.tutorHeaderRow}>
                  <Text style={styles.tutorName}>{selectedTutor.name}</Text>
                </View>

                <View style={styles.badgeRow}>
                  <View style={styles.coachBadge}>
                    <Ionicons name="person" size={11} color={NAVY_BLUE} style={{ marginRight: 4 }} />
                    <Text style={styles.coachBadgeText}>{selectedTutor.type}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </View>

                <View style={styles.traitsCard}>
                  <View style={styles.traitItem}>
                    <Ionicons name="volume-high-outline" size={14} color={NAVY_BLUE} style={{ marginRight: 6 }} />
                    <Text style={styles.traitText}>Voice: {selectedTutor.voice}</Text>
                  </View>
                  <View style={styles.traitsDivider} />
                  <View style={styles.traitItem}>
                    <Ionicons name="globe-outline" size={14} color={NAVY_BLUE} style={{ marginRight: 6 }} />
                    <Text style={styles.traitText}>Accent: {selectedTutor.accent}</Text>
                  </View>
                </View>

                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Today's Progress</Text>
                    <Text style={styles.progressTimeText}>15 min</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarValue, { width: '60%' }]} />
                  </View>
                  <Text style={styles.lessonsCompletedText}>Improve Speaking</Text>
                </View>
              </View>
            </View>
          }
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingContainer}>
                <View style={styles.aiAvatarContainer}>
                  <Image
                    source={{ uri: ROBOT_IMAGE }}
                    style={styles.robotAvatarImg}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={NAVY_BLUE} />
                  <Text style={styles.typingText}>AI is thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* ── Bottom Input ── */}
        <View style={styles.bottomInputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.keyboardButton} activeOpacity={0.8}>
              <Ionicons name="keypad" size={18} color={WHITE} />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />

            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color={WHITE} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRobotImg: {
    width: 48,
    height: 48,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_DARK,
    marginLeft: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeTutorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 6,
  },
  changeTutorText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: NAVY_BLUE,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Top Section ──
  topSection: {
    paddingBottom: 8,
  },

  // ── Video Wrapper (handles overlap spacing) ──
  videoWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
  },

  // ── Video Card ──
  videoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    height: 260,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  videoCardExpanded: {
    height: 360,
  },
  tutorVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cameraOffPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOffText: {
    color: WHITE,
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    marginTop: 10,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },
  liveText: {
    color: WHITE,
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.8,
  },
  expandButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Control Bar (overlapping video bottom) ──
  controlBar: {
    backgroundColor: WHITE,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    marginHorizontal: 10,
    marginTop: -44,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  controlItem: {
    alignItems: 'center',
  },
  controlCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NAVY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  controlCircleDisabled: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlCircleEnd: {
    backgroundColor: '#EF4444',
    borderWidth: 0,
  },
  controlLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },

  // ── Info Panel ──
  infoPanel: {
    flexDirection: 'column',
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  tutorHeaderRow: {
    marginBottom: 2,
  },
  tutorName: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_DARK,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF4FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  coachBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: NAVY_BLUE,
  },
  traitsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  traitItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  traitText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  traitsDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
  },
  progressCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  progressTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: TEXT_DARK,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarValue: {
    height: '100%',
    backgroundColor: NAVY_BLUE,
    borderRadius: 3,
  },
  lessonsCompletedText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: NAVY_BLUE,
  },

  // ── Chat ──
  chatListContent: {
    paddingBottom: 16,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginRight: 16,
    maxWidth: '78%',
  },
  userBubble: {
    backgroundColor: NAVY_BLUE,
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userMessageText: {
    color: WHITE,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  userTimestamp: {
    color: '#93C5FD',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  aiMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginLeft: 16,
    maxWidth: '82%',
  },
  aiAvatarContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  robotAvatarImg: {
    width: 48,
    height: 48,
  },
  aiBubble: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
  },
  aiMessageText: {
    color: TEXT_DARK,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  aiTimestamp: {
    color: TEXT_GRAY,
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 8,
  },
  typingText: {
    fontSize: 13,
    color: TEXT_GRAY,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },

  // ── Bottom Input ──
  bottomInputContainer: {
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    borderTopWidth: 1,
    borderColor: '#EDF2F7',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 28,
    paddingHorizontal: 8,
    height: 50,
  },
  keyboardButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NAVY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TEXT_DARK,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NAVY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
