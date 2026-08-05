import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

interface ListenStepProps {
  content: {
    instruction?: string;
    sentence: string;
    options: string[];
    correctAnswer: string;
  };
  onValidate: (isValid: boolean) => void;
}

const NAVY = '#00334E';
const BLUE = '#3B82F6';

export const ListenStep = ({ content, onValidate }: ListenStepProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const playAudio = () => {
    Speech.speak(content.sentence, { language: 'en-US', rate: 0.85 });
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onValidate(content.options[index] === content.correctAnswer);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{content.instruction || 'What did you hear?'}</Text>

      <View style={styles.audioSection}>
        <TouchableOpacity onPress={playAudio} activeOpacity={0.8} style={styles.speakerBtn}>
          <Ionicons name="volume-high" size={56} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.optionsContainer}>
        {content.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
              onPress={() => handleSelect(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  instruction: { fontSize: 32, fontFamily: 'Nunito-SemiBold', color: NAVY, marginBottom: 60, textAlign: 'center' },
  audioSection: { alignItems: 'center', marginBottom: 60 },
  speakerBtn: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: BLUE, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  optionsContainer: { gap: 15, width: '100%' },
  optionBtn: { 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 20, 
    borderRadius: 18, 
    borderWidth: 2, 
    borderColor: '#E2E8F0', 
    alignItems: 'center' 
  },
  optionBtnSelected: { borderColor: BLUE, backgroundColor: '#F0F9FF' },
  optionText: { fontSize: 22, fontFamily: 'Nunito-SemiBold', color: NAVY },
  optionTextSelected: { color: BLUE }
});
