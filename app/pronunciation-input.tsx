import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const NAVY_BLUE = '#001A33';
const ACCENT_BLUE = '#2563EB';
const LIGHT_ACCENT = '#93C5FD';
const TEXT_GRAY = '#6B7280';

export default function PronunciationInput() {
  const [word, setWord] = useState('');
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePractice = () => {
    if (word.trim()) {
      router.push({
        pathname: '/pronunciation-details',
        params: { word: word.trim() }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={NAVY_BLUE} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.content}
      >
        <Text style={styles.title}>Type in the word that you want to practice</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder=""
            value={word}
            onChangeText={setWord}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {word.length > 0 && (
            <TouchableOpacity onPress={() => setWord('')} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color={TEXT_GRAY} />
            </TouchableOpacity>
          )}
          <View style={styles.underline} />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.practiceButton,
              !word.trim() ? styles.practiceButtonDisabled : styles.practiceButtonActive
            ]}
            onPress={handlePractice}
            disabled={!word.trim()}
          >
            <Text style={[
              styles.practiceButtonText,
              !word.trim() ? styles.practiceButtonTextDisabled : styles.practiceButtonTextActive
            ]}>
              Practice
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    color: NAVY_BLUE,
    fontFamily: 'Nunito-Bold',
    lineHeight: 32,
    marginBottom: 40,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    fontSize: 24,
    color: ACCENT_BLUE,
    fontFamily: 'Nunito-Bold',
    paddingVertical: 10,
    paddingRight: 30,
  },
  clearIcon: {
    position: 'absolute',
    right: 0,
    top: 15,
  },
  underline: {
    height: 1.5,
    backgroundColor: ACCENT_BLUE,
    width: '100%',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    alignItems: 'center',
  },
  practiceButton: {
    width: 180,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceButtonDisabled: {
    backgroundColor: '#A5C4FF', // Light blue from image
  },
  practiceButtonActive: {
    backgroundColor: '#2563EB', // Vibrant blue from image
  },
  practiceButtonText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
  },
  practiceButtonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  practiceButtonTextActive: {
    color: '#FFFFFF',
  },
});
