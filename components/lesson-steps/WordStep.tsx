import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { MotiView } from 'moti';

interface WordStepProps {
  content: {
    word: string;
    phonetic: string;
    meaning: string;
  };
  onValidate: (isValid: boolean) => void;
}

const NAVY = '#00334E';
const LIGHT_BLUE = '#E6F0FA';

export const WordStep = ({ content, onValidate }: WordStepProps) => {
  useEffect(() => {
    onValidate(true);
  }, []);

  const speak = () => {
    Speech.speak(content.word, { language: 'en-US', rate: 0.85 });
  };

  return (
    <View style={styles.container}>
      <MotiView 
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.content}
      >
        <Text style={styles.word}>{content.word}</Text>
        <Text style={styles.phonetic}>{content.phonetic}</Text>

        <TouchableOpacity 
          style={styles.listenBtn} 
          onPress={speak}
          activeOpacity={0.8}
        >
          <Ionicons name="volume-high" size={24} color="#3B82F6" />
          <Text style={styles.listenBtnText}>Listen Pronunciation</Text>
        </TouchableOpacity>

        <View style={styles.meaningCard}>
          <Text style={styles.meaningLabel}>MEANING</Text>
          <Text style={styles.meaningText}>{content.meaning}</Text>
        </View>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  content: { alignItems: 'center', width: '100%' },
  word: { fontSize: 64, fontFamily: 'Inter-SemiBold', color: '#000000', marginBottom: 10 },
  phonetic: { fontSize: 28, fontFamily: 'Inter-Regular', color: '#000000', marginBottom: 40 },
  listenBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: LIGHT_BLUE, 
    paddingHorizontal: 30, 
    paddingVertical: 18, 
    borderRadius: 40, 
    gap: 12, 
    marginBottom: 80 
  },
  listenBtnText: { color: '#000000', fontSize: 20, fontFamily: 'Inter-SemiBold' },
  meaningCard: { 
    width: '100%', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 24, 
    padding: 30, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  meaningLabel: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#000000', letterSpacing: 1, marginBottom: 15 },
  meaningText: { fontSize: 22, fontFamily: 'Inter-Regular', color: '#000000', lineHeight: 32 }
});
