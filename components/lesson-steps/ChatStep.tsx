import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { MotiView } from 'moti';

interface ChatStepProps {
  content: {
    question: string;
    options: string[];
    correctAnswer: string;
    avatar?: string;
  };
  onSelect: (option: string | null) => void;
  isChecked: boolean;
  isCorrect: boolean | null;
  selectedOption: string | null;
}

const NAVY = '#0B2A4A';
const LIGHT_BLUE = '#E6F0FA';

export const ChatStep = ({ 
  content, 
  onSelect, 
  isChecked, 
  isCorrect, 
  selectedOption 
}: ChatStepProps) => {

  const playAudio = () => {
    Speech.speak(content.question, { language: 'en-US', rate: 0.9 });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete the chat</Text>

      <View style={styles.chatSection}>
        {/* Left Bubble */}
        <View style={styles.leftRow}>
          <Image 
            source={{ uri: content.avatar || 'https://cdn3d.iconscout.com/3d/premium/thumb/boy-avatar-6299537-5187871.png' }} 
            style={styles.avatar} 
          />
          <MotiView 
            from={{ opacity: 0, scale: 0.5, translateX: -20 }}
            animate={{ opacity: 1, scale: 1, translateX: 0 }}
            style={styles.leftBubble}
          >
            <Text style={styles.chatText}>{content.question}</Text>
            <TouchableOpacity onPress={playAudio} style={styles.audioIcon}>
              <Ionicons name="volume-high" size={20} color={NAVY} />
            </TouchableOpacity>
            <View style={styles.leftTail} />
          </MotiView>
        </View>

        {/* Right Bubble */}
        <View style={styles.rightRow}>
          <MotiView 
            animate={{ 
              backgroundColor: isCorrect ? '#FFFFFF' : '#F8FAFC',
              borderColor: isCorrect ? NAVY : '#E2E8F0'
            }}
            style={[styles.rightBubble, isCorrect && styles.rightBubbleFilled]}
          >
            <Text style={[
              styles.chatText, 
              !isCorrect && styles.placeholderText,
              isCorrect && styles.filledText
            ]}>
              {isCorrect ? selectedOption : '---'}
            </Text>
            <View style={styles.rightTail} />
          </MotiView>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        {content.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const showResult = isChecked && isSelected;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionBtn,
                isSelected && styles.optionSelected,
                (showResult && isCorrect === false) && styles.optionWrong
              ]}
              onPress={() => !isChecked && onSelect(option)}
              activeOpacity={0.7}
              disabled={isChecked}
            >
              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected
              ]}>
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
  container: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-SemiBold',
    color: NAVY,
    marginBottom: 40,
  },
  chatSection: {
    flex: 1,
    gap: 30,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: LIGHT_BLUE,
  },
  leftBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 16,
    maxWidth: '75%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leftTail: {
    position: 'absolute',
    bottom: -2,
    left: -10,
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#E2E8F0',
    transform: [{ rotate: '45deg' }],
    zIndex: -1,
  },
  rightRow: {
    alignItems: 'flex-end',
  },
  rightBubble: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 16,
    minWidth: 100,
    maxWidth: '75%',
  },
  rightBubbleFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: NAVY,
  },
  rightTail: {
    position: 'absolute',
    bottom: -2,
    right: -10,
    width: 20,
    height: 20,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#E2E8F0',
    transform: [{ rotate: '-45deg' }],
    zIndex: -1,
  },
  chatText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: NAVY,
  },
  placeholderText: {
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 2,
  },
  filledText: {
    color: NAVY,
    fontFamily: 'Inter-SemiBold',
  },
  audioIcon: {
    padding: 4,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  optionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: NAVY,
    backgroundColor: LIGHT_BLUE,
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionText: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: NAVY,
  },
  optionTextSelected: {
    fontFamily: 'Nunito-SemiBold',
  },
});
