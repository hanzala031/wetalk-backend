import { useState } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { apiClient } from '@/lib/api-client';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/auth-context';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
} from '@/constants/google';

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthSource = 'signin' | 'signup';

export function useGoogleAuth() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn } = useAuth();

  const [request, , promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({ scheme: 'app' }),
  });

  const signInWithGoogle = async (source: GoogleAuthSource) => {
    const isConfigured =
      GOOGLE_WEB_CLIENT_ID &&
      !GOOGLE_WEB_CLIENT_ID.includes('your_google_web_client_id_here');

    setIsGoogleLoading(true);
    try {
      let idToken = 'mock-google-token';

      if (isConfigured && request) {
        const result = await promptAsync();
        if (result?.type !== 'success') {
          setIsGoogleLoading(false);
          return;
        }
        idToken =
          result.authentication?.idToken ?? (result.params?.id_token as string | undefined) ?? 'mock-google-token';
      }

      const response = await apiClient.post('/auth/google', { idToken });

      if (response.data.success) {
        const { token, user, isNewUser } = response.data;
        const name = user.name || '';
        const shouldGoToSetup = isNewUser || !name || name === 'Google Learner' || name === 'Learner';

        await signIn(token, user, shouldGoToSetup);

        if (shouldGoToSetup) {
          await AsyncStorage.setItem('is_new_user_signup', 'true');
          await AsyncStorage.multiRemove(['completed_lessons', 'user_stats', 'lesson_progress']);
          router.push({
            pathname: '/profile-setup',
            params: { name: name },
          });
        }
      } else {
        Alert.alert('Google Sign-In Failed', response.data.message || 'Something went wrong');
      }
    } catch (error: any) {
      console.error('Google auth error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || 'Google sign-in failed. Please try again.';
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isGoogleLoading,
    isGoogleReady: !!request,
  };
}
