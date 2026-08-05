import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';

interface SentenceBuilderStepProps {
  content: {
    sentence: string;
    words: string[];
    correctOrder: string[];
  };
  onValidate: (isValid: boolean) => void;
}

const NAVY = '#0B2A4A';
const BLACK = '#000000';

export const SentenceBuilderStep = ({ content, onValidate }: SentenceBuilderStepProps) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState(content.words);

  const handleSelectWord = (word: string, index: number) => {
    const newSelected = [...selectedWords, word];
    const newAvailable = availableWords.filter((_, i) => i !== index);
    
    setSelectedWords(newSelected);
    setAvailableWords(newAvailable);

    if (newSelected.length === content.correctOrder.length) {
      const isCorrect = newSelected.every((w, i) => w === content.correctOrder[i]);
      onValidate(isCorrect);
    }
  };

  const handleReset = () => {
    setSelectedWords([]);
    setAvailableWords(content.words);
    onValidate(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Build the sentence</Text>
      
      <View style={styles.sentenceArea}>
        {content.correctOrder.map((_, i) => (
          <View key={i} style={styles.blank}>
            {selectedWords[i] && (
              <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} style={styles.wordPill}>
                <Text style={styles.wordPillText}>{selectedWords[i]}</Text>
              </MotiView>
            )}
          </View>
        ))}
      </View>

      <View style={styles.wordsContainer}>
        {availableWords.map((word, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.wordOption} 
            onPress={() => handleSelectWord(word, index)}
          >
            <Text style={styles.wordOptionText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedWords.length > 0 && (
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  headerText: { fontSize: 24, fontFamily: 'Inter-SemiBold', color: BLACK, marginBottom: 40, textAlign: 'center' },
  sentenceArea: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 60, minHeight: 100, justifyContent: 'center' },
  blank: { minWidth: 60, height: 40, borderBottomWidth: 2, borderBottomColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  wordPill: { backgroundColor: NAVY, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  wordPillText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter-SemiBold' },
  wordsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  wordOption: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, borderWidth: 2, borderColor: '#E2E8F0' },
  wordOptionText: { fontSize: 18, color: BLACK, fontFamily: 'Inter-Regular' },
  resetBtn: { marginTop: 30, alignSelf: 'center' },
  resetText: { color: BLACK, fontSize: 16, fontFamily: 'Inter-Regular', textDecorationLine: 'underline' }
});
