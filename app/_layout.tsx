import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
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
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: 'index',
};

function RootNavigation() {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(tabs)';
    const inSignGroup = firstSegment === 'sign-in' || firstSegment === 'sign-up';
    const isIndex = !segments || (segments as any).length === 0 || firstSegment === 'index' || firstSegment === '(auth)'; // Adjust based on your index

    if (!userToken && inAuthGroup) {
      // Redirect to sign-in if not logged in and trying to access tabs
      router.replace('/sign-in');
    } else if (userToken && (inSignGroup || firstSegment === undefined || firstSegment === 'index' || firstSegment?.startsWith('onboarding'))) {
      // Redirect to tabs if logged in and trying to access sign-in, sign-up, or onboarding
      router.replace('/(tabs)');
    }
  }, [userToken, isLoading, segments]);

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
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-details" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-player" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-completion" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="change-tutor" options={{ headerShown: false }} />
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

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
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
