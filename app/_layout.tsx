import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: 'index',
};

function RootNavigation() {
  const { userToken, isProfileCompleted, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(tabs)';
    const inSignGroup = firstSegment === 'sign-in' || firstSegment === 'sign-up';
    const isProfileSetup = firstSegment === 'profile-setup';

    if (!userToken) {
      // Redirect to sign-in if not logged in and trying to access private stacks
      if (inAuthGroup || isProfileSetup || firstSegment === 'welcome') {
        router.replace('/sign-in');
      }
    } else {
      // Authenticated
      if (!isProfileCompleted) {
        // Strict guard: Authenticated but profile is NOT completed -> Render profile-setup or welcome
        if (firstSegment !== 'profile-setup' && firstSegment !== 'welcome') {
          router.replace('/profile-setup');
        }
      } else {
        // Authenticated and profile is completed -> Render Main App Stack
        if (inSignGroup || firstSegment === undefined || firstSegment === 'index' || isProfileSetup || firstSegment === 'welcome' || firstSegment?.startsWith('onboarding')) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [userToken, isProfileCompleted, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-intro" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-language" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-level" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-reason" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-goal" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-achieve" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-source" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-placement" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-details" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-player" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-completion" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="change-tutor" options={{ headerShown: false }} />
      <Stack.Screen name="buy-wt-coins" options={{ headerShown: false }} />
      <Stack.Screen name="redeem-wt-coins" options={{ headerShown: false }} />
      <Stack.Screen name="pay-with-visa" options={{ headerShown: false }} />
      <Stack.Screen name="pay-with-paypal" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  const [fontTimeoutPassed, setFontTimeoutPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFontTimeoutPassed(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 800);

    if (loaded || error) {
      clearTimeout(timer);
      SplashScreen.hideAsync().catch(() => {});
    }

    return () => clearTimeout(timer);
  }, [loaded, error]);

  if (!loaded && !error && !fontTimeoutPassed) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigation />
            <StatusBar style="auto" />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
