import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, NativeModules } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

const isVoiceNativeModuleAvailable = false;

interface SpeakStepProps {
  content: {
    instruction: string;
    sentence: string;
  };
  onValidate: (isValid: boolean) => void;
}

const NAVY = '#00334E';
const BLUE = '#3B82F6';

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

export const SpeakStep = ({ content, onValidate }: SpeakStepProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');



  const toggleRecording = async () => {
    if (isRecording) {
      setSpokenText(content.sentence);
      onValidate(true);
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{content.instruction || 'Say the sentence above clearly.'}</Text>

      <View style={styles.sentenceCard}>
        <Ionicons name="volume-high" size={28} color={BLUE} />
        <Text style={styles.sentenceText}>{content.sentence}</Text>
      </View>

      <View style={styles.micSection}>
        {isRecording && [1, 2, 3].map((i) => (
          <MotiView
            key={i}
            from={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.8 + i * 0.3, opacity: 0 }}
            transition={{ type: 'timing', duration: 1500, loop: true, delay: i * 300 }}
            style={styles.pulseRing}
          />
        ))}
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={toggleRecording}
          activeOpacity={0.8}
        >
          <Ionicons name="mic" size={60} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.micLabel}>{isRecording ? "Listening..." : "Tap to Speak"}</Text>
      </View>

      {spokenText !== '' && <Text style={styles.spokenText}>&quot;{spokenText}&quot;</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, alignItems: 'center', paddingHorizontal: 20 },
  instruction: { fontSize: 24, fontFamily: 'Inter-SemiBold', color: '#000000', marginBottom: 40, textAlign: 'center' },
  sentenceCard: { 
    backgroundColor: '#FFFFFF', 
    width: '100%', 
    padding: 30, 
    borderRadius: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 15, 
    marginBottom: 80,
    borderWidth: 2,
    borderColor: '#E2E8F0'
  },
  sentenceText: { fontSize: 32, fontFamily: 'Inter-SemiBold', color: '#000000', flex: 1 },
  micSection: { alignItems: 'center', justifyContent: 'center' },
  micButton: { 
    width: 130, 
    height: 130, 
    borderRadius: 65, 
    backgroundColor: '#004D73', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 10,
    elevation: 8
  },
  micButtonActive: { backgroundColor: BLUE },
  pulseRing: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#004D73', zIndex: 1 },
  micLabel: { marginTop: 20, fontSize: 20, fontFamily: 'Inter-SemiBold', color: '#000000' },
  spokenText: { marginTop: 40, fontSize: 22, fontFamily: 'Inter-Regular', color: '#000000', textAlign: 'center' }
});
