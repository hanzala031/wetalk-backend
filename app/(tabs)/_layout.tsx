import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userName } = useAuth();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#111827',
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t('practice'),
          tabBarIcon: ({ color }) => <Ionicons size={28} name="book-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: t('achievements'),
          tabBarIcon: ({ color }) => <Ionicons size={28} name="trophy-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: userName || t('profile'),
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-circle-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
