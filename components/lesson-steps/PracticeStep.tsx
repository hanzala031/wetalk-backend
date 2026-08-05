import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PracticeStepProps {
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

export const PracticeStep = ({ content, onValidate }: PracticeStepProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onValidate(content.options[index] === content.correctAnswer);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{content.instruction || 'Fill in the blank:'}</Text>

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
  instruction: { fontSize: 36, fontFamily: 'Nunito-SemiBold', color: NAVY, marginBottom: 60, textAlign: 'left' },
  optionsContainer: { gap: 15, width: '100%' },
  optionBtn: { 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 22, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#E2E8F0', 
    paddingHorizontal: 30,
    alignItems: 'flex-start'
  },
  optionBtnSelected: { borderColor: BLUE, backgroundColor: '#F0F9FF' },
  optionText: { fontSize: 24, fontFamily: 'Nunito-SemiBold', color: BLUE },
  optionTextSelected: { color: NAVY }
});
