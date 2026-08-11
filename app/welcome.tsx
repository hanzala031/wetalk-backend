import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { apiClient, authConfig } from '@/lib/api-client';
import { useLanguage } from '@/context/language-context';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

// --- Helper: Floating Particle (Confetti) ---
const Particle = ({ delay, color, size, top, left }: any) => (
  <MotiView
    from={{ opacity: 0, scale: 0, translateY: 0 }}
    animate={{ opacity: 0.6, scale: 1, translateY: -20 }}
    transition={{
      type: 'timing',
      duration: 2000,
      loop: true,
      delay,
      repeatReverse: true,
    }}
    style={[
      styles.particle,
      {
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
        top,
        left,
      },
    ]}
  />
);

export default function WelcomeScreen() {
  const { name, avatar } = useLocalSearchParams<{ name: string; avatar: string }>();
  const { setUserData } = useAuth();
  const { t } = useLanguage();

  const handleContinue = async () => {
    // Save profile image & set isProfileCompleted: true to backend database
    try {
      await apiClient.put(
        '/user/profile',
        {
          name: name || '',
          profileImage: avatar || '',
          isProfileCompleted: true
        }
      );
    } catch (err) {
      console.warn('Failed to update backend profile completed status:', err);
    }

    // Update local AuthContext state to reflect completed onboarding
    await setUserData(name || 'Learner', avatar || '', undefined, true);

    // Clean navigation reset/replace to the tabs dashboard
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background Particles (Confetti Effect) */}
      <Particle color="#38BDF8" size={8} top={100} left={width * 0.2} delay={0} />
      <Particle color="#FACC15" size={6} top={150} left={width * 0.8} delay={400} />
      <Particle color="#4ADE80" size={10} top={height * 0.4} left={width * 0.1} delay={800} />
      <Particle color="#F87171" size={7} top={height * 0.3} left={width * 0.85} delay={1200} />
      <Particle color="#A78BFA" size={9} top={height * 0.6} left={width * 0.05} delay={200} />
      <Particle color="#FB923C" size={6} top={height * 0.7} left={width * 0.9} delay={600} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#000000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          style={styles.textSection}
        >
          <Text style={styles.title}>{t('profile_setup_success')}</Text>
          <Text style={styles.subtitle}>
            {t('avatar_confirmed_desc', { name: name || 'User' })}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 1500, delay: 300 }}
          style={styles.avatarVisualContainer}
        >
          <View style={styles.glowCircle}>
            <View style={styles.avatarBorder}>
              <View style={styles.avatarCircle}>
                <Image 
                  source={{ uri: avatar || 'https://api.dicebear.com/7.x/adventurer/png?seed=Felix&size=128' }} 
                  style={styles.avatarImage} 
                />
              </View>
            </View>
            
            {/* Checkmark Badge */}
            <MotiView 
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 1000 }}
              style={styles.checkBadge}
            >
              <Ionicons name="checkmark-circle" size={50} color="#4ADE80" />
            </MotiView>
          </View>
        </MotiView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>{t('go_to_dashboard')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Very light blue background
  },
  particle: {
    position: 'absolute',
    opacity: 0.6,
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
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
  },
  avatarVisualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#38BDF8',
    padding: 8,
    backgroundColor: '#FFF',
    elevation: 15,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  avatarCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFF',
    borderRadius: 25,
    elevation: 5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#0F5B7F',
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    letterSpacing: 1,
  },
});
