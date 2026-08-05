import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, useAnimationState } from 'moti';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// --- Sub-component: Duolingo-style Progress Bar ---
const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBackground}>
      <MotiView 
        from={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'timing', duration: 1000 }}
        style={styles.progressFill}
      >
        <View style={styles.progressGlow} />
      </MotiView>
    </View>
  </View>
);

// --- Sub-component: WeBot Mascot ---
const WeBot = () => {
  const blinkingState = useAnimationState({
    open: { scaleY: 1 },
    closed: { scaleY: 0.1 },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      blinkingState.transitionTo('closed');
      setTimeout(() => {
        blinkingState.transitionTo('open');
      }, 150);
    }, 1000);
    return () => clearInterval(interval);
  }, [blinkingState]);

  return (
    <MotiView
      from={{ translateY: 0 }}
      animate={{ translateY: -15 }}
      transition={{
        type: 'timing',
        duration: 2000,
        loop: true,
        repeatReverse: true,
      }}
      style={styles.botContainer}
    >
      <View style={styles.botBody}>
        <View style={styles.botFace}>
          <View style={styles.eyesRow}>
            <MotiView state={blinkingState} style={styles.eye} />
            <MotiView state={blinkingState} style={styles.eye} />
          </View>
          <View style={styles.smile} />
        </View>
        <View style={[styles.antenna, { left: -10 }]} />
        <View style={[styles.antenna, { right: -10 }]} />
      </View>
      <View style={styles.botShadow} />
    </MotiView>
  );
};

const SpeechBubble = ({ text }: { text: string }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.8, translateY: 10 }}
    animate={{ opacity: 1, scale: 1, translateY: 0 }}
    transition={{ type: 'spring', delay: 300 }}
    style={styles.bubbleContainer}
  >
    <View style={styles.bubble}>
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
    <View style={styles.bubbleTail} />
  </MotiView>
);

export const OnboardingIntroScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Progress Bar */}
      <View style={styles.header}>
        <View style={{ width: 28 }} /> 
        <ProgressBar progress={10} />
      </View>

      <View style={styles.content}>
        <SpeechBubble text="Hi there! I'm WeBot!" />
        <WeBot />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.button}
          onPress={() => router.push('/onboarding-language')}
        >
          <Text style={styles.buttonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    height: 70,
  },
  backButton: {
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
  },
  progressBackground: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0F5B7F',
    borderRadius: 7,
  },
  progressGlow: {
    position: 'absolute',
    top: 2,
    left: '10%',
    width: '80%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  bubbleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
  },
  bubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E5E7EB',
    marginTop: -2,
  },
  botContainer: {
    alignItems: 'center',
    width: 200,
    height: 220,
    justifyContent: 'center',
  },
  botBody: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  botFace: {
    width: 100,
    height: 75,
    borderRadius: 35,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  eyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
    marginBottom: 8,
  },
  eye: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#38BDF8',
  },
  smile: {
    width: 25,
    height: 12,
    borderBottomWidth: 3,
    borderColor: '#38BDF8',
    borderRadius: 12,
    marginTop: 2,
    opacity: 1,
  },
  antenna: {
    position: 'absolute',
    top: 45,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  botShadow: {
    width: 100,
    height: 15,
    backgroundColor: '#000',
    opacity: 0.05,
    borderRadius: 10,
    marginTop: 25,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#0F5B7F',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F5B7F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    letterSpacing: 1,
  },
});

export default OnboardingIntroScreen;
