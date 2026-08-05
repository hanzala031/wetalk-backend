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
    if (!GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        'Google Sign-In',
        'Google sign-in is not configured. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file.'
      );
      return;
    }

    if (!request) {
      Alert.alert('Error', 'Google sign-in is not ready yet. Please try again.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const result = await promptAsync();

      if (result?.type !== 'success') {
        return;
      }

      const idToken =
        result.authentication?.idToken ?? (result.params?.id_token as string | undefined);

      if (!idToken) {
        Alert.alert('Error', 'Could not get Google authentication token.');
        return;
      }

      const response = await apiClient.post('/auth/google', { idToken });

      if (response.data.success) {
        const { token, user, isNewUser } = response.data;
        await signIn(token, user);

        if (source === 'signup' && isNewUser) {
          await AsyncStorage.multiRemove(['completed_lessons', 'user_stats', 'lesson_progress']);
          router.push({
            pathname: '/profile-setup',
            params: { name: user.name || '' },
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
