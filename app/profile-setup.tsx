import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView, useAnimationState } from 'moti';
import { useLanguage } from '@/context/language-context';

const { width } = Dimensions.get('window');

// Avatar Placeholders (using free remote images or icons)
const AVATARS = [
  { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' },
  { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png' },
  { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140051.png' },
  { id: '5', uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140061.png' },
  { id: '6', uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140043.png' },
  { id: '7', uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140059.png' },
  { id: '8', uri: 'https://cdn-icons-png.flaticon.com/512/1154/1154444.png' },
  { id: '9', uri: 'https://cdn-icons-png.flaticon.com/512/1154/1154480.png' },
];

// --- Sub-component: WeBot Mascot ---
const WeBotAvatar = ({ size = 80, eyeColor = '#38BDF8' }) => {
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
    <View style={[styles.botBody, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.botFace, { width: size * 0.7, height: size * 0.6 }]}>
          <View style={[styles.eyesRow, { width: size * 0.4 }]}>
            <MotiView state={blinkingState} style={[styles.eye, { backgroundColor: eyeColor, width: size * 0.12, height: size * 0.12 }]} />
            <MotiView state={blinkingState} style={[styles.eye, { backgroundColor: eyeColor, width: size * 0.12, height: size * 0.12 }]} />
          </View>
          <View style={[styles.smile, { borderColor: eyeColor, width: size * 0.2, height: size * 0.1 }]} />
        </View>
    </View>
  );
};

export default function ProfileSetupScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [selectedAvatar, setSelectedAvatar] = useState('2');
  const { t } = useLanguage();

  const handleContinue = () => {
    const avatar = AVATARS.find(a => a.id === selectedAvatar);
    router.replace({
      pathname: '/welcome',
      params: { name, avatar: avatar?.uri }
    });
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('personalize_profile')}</Text>
        <Text style={styles.subtitle}>{t('choose_avatar', { name: name || 'User' })}</Text>

        <View style={styles.mainAvatarContainer}>
            <View style={styles.avatarBorder}>
                <View style={styles.avatarCircle}>
                    <Image 
                      source={{ uri: AVATARS.find(a => a.id === selectedAvatar)?.uri }} 
                      style={{ width: '100%', height: '100%', borderRadius: 55 }} 
                    />
                </View>
            </View>
        </View>

        <Text style={styles.sectionLabel}>{t('select_avatar')}</Text>

        <View style={styles.avatarGrid}>
          {AVATARS.map((avatar) => (
            <TouchableOpacity
              key={avatar.id}
              onPress={() => setSelectedAvatar(avatar.id)}
              style={[
                styles.avatarItem,
                selectedAvatar === avatar.id && styles.selectedAvatarItem,
              ]}
            >
              <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>{t('continue').toUpperCase()}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>{t('skip_profile')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 16,
    height: 60,
    justifyContent: 'center',
  },
  backButton: {
    padding: 5,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito-ExtraBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  mainAvatarContainer: {
    marginBottom: 35,
  },
  avatarBorder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  avatarCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#111827',
    marginBottom: 20,
    width: '100%',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  avatarItem: {
    width: (width - 48 - 36) / 4, // 4 items per row
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedAvatarItem: {
    borderColor: '#0F5B7F',
    backgroundColor: '#EBF5FF',
  },
  avatarImage: {
    width: '75%',
    height: '75%',
    borderRadius: 10,
  },
  // Bot Styles
  botBody: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botFace: {
    borderRadius: 15,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eye: {
    borderRadius: 5,
  },
  smile: {
    borderBottomWidth: 2,
    borderRadius: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 15,
    backgroundColor: '#F5F7FA',
  },
  button: {
    backgroundColor: '#0F5B7F',
    height: 56,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    letterSpacing: 1,
  },
  skipButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    letterSpacing: 0.5,
  },
});
