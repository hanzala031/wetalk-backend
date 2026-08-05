import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface SelectionStepProps {
  content: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
  onValidate: (isCorrect: boolean) => void;
}

export const SelectionStep = ({ content, onValidate }: SelectionStepProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onValidate(option === content.correctAnswer);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{content.question}</Text>

      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {content.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionCard,
              selectedOption === option && styles.selectedOption
            ]}
            onPress={() => handleSelect(option)}
          >
            <Text style={[
              styles.optionText,
              selectedOption === option && styles.selectedOptionText
            ]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  question: {
    fontSize: 24,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
    marginBottom: 40,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedOption: {
    borderColor: '#0F5B7F',
    backgroundColor: '#E0F2FE',
  },
  optionText: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
  },
  selectedOptionText: {
    color: '#000000',
  },
});
