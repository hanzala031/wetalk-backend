import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, authConfig, isNetworkError, logApiError } from '@/lib/api-client';

interface AuthContextType {
  isNewUser: boolean | null;
  userToken: string | null;
  userName: string | null;
  userAvatar: string | null;
  userEmail: string | null;
  completeOnboarding: () => Promise<void>;
  setUserData: (name: string, avatar: string, email?: string) => Promise<void>;
  signIn: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
  initializeNewUser: () => Promise<void>;
  syncProgressToBackend: (tokenOverride?: string) => Promise<void>;
  loadProgressFromBackend: (tokenOverride?: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadState() {
      try {
        const newUserVal = await SecureStore.getItemAsync('isNewUser');
        const token = await SecureStore.getItemAsync('userToken');
        let name = await SecureStore.getItemAsync('userName');
        let avatar = await SecureStore.getItemAsync('userAvatar');
        let email = await SecureStore.getItemAsync('userEmail');
        
        if (avatar === 'default-avatar.png') {
          avatar = '';
        }
        
        // Fetch latest profile info from backend if user is logged in
        if (token) {
          try {
            const response = await apiClient.get('/user/profile', authConfig(token, { timeout: 10000 }));
            if (response.data && response.data.success && response.data.user) {
              const u = response.data.user;
              name = u.name || '';
              avatar = u.profileImage || '';
              email = u.email || '';
              if (avatar === 'default-avatar.png') {
                avatar = '';
              }
              // Filter out local server URLs (http://...) - only keep https:// or data: URIs
              // Local server URLs break when the device IP changes
              if (avatar && avatar.startsWith('http://') && !avatar.startsWith('https://')) {
                avatar = ''; // Clear invalid local URL
              }
              
              // Keep local storage in sync
              await Promise.all([
                SecureStore.setItemAsync('userName', name || ''),
                SecureStore.setItemAsync('userAvatar', avatar || ''),
                SecureStore.setItemAsync('userEmail', email || ''),
              ]);
            }
          } catch (apiErr) {
            if (!isNetworkError(apiErr)) {
              logApiError('Failed to fetch user profile on app load', apiErr);
            }
          }
        }
        
        setIsNewUser(newUserVal === null || newUserVal === 'true');
        setUserToken(token);
        setUserName(name);
        setUserAvatar(avatar);
        setUserEmail(email);
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadState();
  }, []);

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync('isNewUser', 'false');
    setIsNewUser(false);
  };

  const setUserData = async (name: string, avatar: string, email?: string) => {
    try {
      let cleanAvatar = avatar || '';
      if (cleanAvatar === 'default-avatar.png') {
        cleanAvatar = '';
      }
      const finalEmail = email !== undefined ? (email || '') : (userEmail || '');
      await Promise.all([
        SecureStore.setItemAsync('userName', name),
        SecureStore.setItemAsync('userAvatar', cleanAvatar),
        SecureStore.setItemAsync('userEmail', finalEmail),
      ]);
      setUserName(name);
      setUserAvatar(cleanAvatar);
      setUserEmail(finalEmail);
    } catch (e) {
      console.error('Error saving user data', e);
    }
  };

  const initializeNewUser = async () => {
    try {
      // Clear all keys related to the previous user's learning progress
      const keysToClear = [
        'completed_lessons', 
        'user_stats', 
        'lesson_progress', 
      ];
      
      // Also clear any 24h lock timestamps for all professional lessons
      const lockKeys = Array.from({ length: 10 }, (_, i) => `unlock_time_prof_${i + 1}`);
      
      await AsyncStorage.multiRemove([...keysToClear, ...lockKeys]);

      // Initialize fresh default stats
      const defaultStats = {
        xp: 0,
        coins: 0,
        gems: 10,
        streak: 0,
        lastDate: null, 
      };

      await AsyncStorage.setItem('user_stats', JSON.stringify(defaultStats));
      await AsyncStorage.setItem('completed_lessons', JSON.stringify([]));
      
      console.log("New user initialized: Progress reset to Lesson 1.");
    } catch (error) {
      console.error("Error initializing new user:", error);
    }
  };

  const clearAllLocalProgressKeys = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => 
        key === 'completed_lessons' ||
        key === 'user_stats' ||
        key === 'lesson_progress' ||
        key.startsWith('completed_words_') ||
        key.startsWith('completed_practice_') ||
        key.startsWith('completed_quiz_') ||
        key.startsWith('completed_review_') ||
        key.startsWith('completed_listen_repeat_') ||
        key.startsWith('completed_fill_blanks_') ||
        key.startsWith('lesson_finished_') ||
        key.startsWith('completion_date_') ||
        key.startsWith('unlock_time_')
      );
      if (progressKeys.length > 0) {
        await AsyncStorage.multiRemove(progressKeys);
      }
    } catch (e) {
      console.error('Error clearing local progress keys:', e);
    }
  };

  const syncProgressToBackend = async (tokenOverride?: string) => {
    try {
      const token = tokenOverride || userToken || await SecureStore.getItemAsync('userToken');
      if (!token) return;

      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => 
        key === 'completed_lessons' ||
        key === 'user_stats' ||
        key === 'lesson_progress' ||
        key.startsWith('completed_words_') ||
        key.startsWith('completed_practice_') ||
        key.startsWith('completed_quiz_') ||
        key.startsWith('completed_review_') ||
        key.startsWith('completed_listen_repeat_') ||
        key.startsWith('completed_fill_blanks_') ||
        key.startsWith('lesson_finished_') ||
        key.startsWith('completion_date_') ||
        key.startsWith('unlock_time_')
      );

      if (progressKeys.length === 0) return;

      const keyValuePairs = await AsyncStorage.multiGet(progressKeys);
      const progressData: Record<string, string> = {};
      keyValuePairs.forEach(([key, val]) => {
        if (val !== null) {
          progressData[key] = val;
        }
      });

      await apiClient.post('/user/sync', { progressData }, authConfig(token));
      console.log('Progress successfully synced to backend');
    } catch (e) {
      console.error('Error syncing progress to backend:', e);
    }
  };

  const loadProgressFromBackend = async (tokenOverride?: string) => {
    try {
      const token = tokenOverride || userToken || await SecureStore.getItemAsync('userToken');
      if (!token) return;

      const response = await apiClient.get('/user/sync', authConfig(token));

      if (response.data && response.data.success && response.data.progressData) {
        const progressData = response.data.progressData;
        const keyValuePairs: [string, string][] = Object.entries(progressData);
        if (keyValuePairs.length > 0) {
          await clearAllLocalProgressKeys();
          await AsyncStorage.multiSet(keyValuePairs);
          console.log('Progress successfully loaded from backend');
        } else {
          // Backend progress is empty. Let's make sure we have default progress local and sync it.
          const localStats = await AsyncStorage.getItem('user_stats');
          if (!localStats) {
            const defaultStats = {
              xp: 0,
              coins: 0,
              gems: 10,
              streak: 0,
              lastDate: null, 
            };
            await AsyncStorage.setItem('user_stats', JSON.stringify(defaultStats));
            await AsyncStorage.setItem('completed_lessons', JSON.stringify([]));
          }
          await syncProgressToBackend(token);
        }
      } else {
        // Backend response did not contain progressData
        const localStats = await AsyncStorage.getItem('user_stats');
        if (!localStats) {
          const defaultStats = {
            xp: 0,
            coins: 0,
            gems: 10,
            streak: 0,
            lastDate: null, 
          };
          await AsyncStorage.setItem('user_stats', JSON.stringify(defaultStats));
          await AsyncStorage.setItem('completed_lessons', JSON.stringify([]));
        }
        await syncProgressToBackend(token);
      }
    } catch (e) {
      console.error('Error loading progress from backend:', e);
    }
  };

  const signIn = async (token: string, user: any) => {
    try {
      const name = user.name || '';
      let avatar = user.profileImage || '';
      if (avatar === 'default-avatar.png') {
        avatar = '';
      }
      // Filter out local server URLs that break on different networks/sessions
      if (avatar && avatar.startsWith('http://') && !avatar.startsWith('https://')) {
        avatar = '';
      }
      const email = user.email || '';
      
      await Promise.all([
        SecureStore.setItemAsync('userToken', token),
        SecureStore.setItemAsync('userName', String(name)),
        SecureStore.setItemAsync('userAvatar', String(avatar)),
        SecureStore.setItemAsync('userEmail', String(email)),
      ]);
      setUserToken(token);
      setUserName(name);
      setUserAvatar(avatar);
      setUserEmail(email);

      // Load their progress from backend!
      await loadProgressFromBackend(token);

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Error saving auth data', e);
    }
  };

  const signOut = async () => {
    try {
      // First, sync any unsynced progress to backend before signing out
      await syncProgressToBackend();

      await Promise.all([
        SecureStore.deleteItemAsync('userToken'),
        SecureStore.deleteItemAsync('userName'),
        SecureStore.deleteItemAsync('userAvatar'),
        SecureStore.deleteItemAsync('userEmail'),
        clearAllLocalProgressKeys()
      ]);
      setUserToken(null);
      setUserName(null);
      setUserAvatar(null);
      setUserEmail(null);
      router.replace('/sign-in');
    } catch (e) {
      console.error('Error during sign out', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isNewUser, 
      userToken, 
      userName,
      userAvatar,
      userEmail,
      completeOnboarding,
      setUserData,
      signIn, 
      signOut, 
      initializeNewUser,
      syncProgressToBackend,
      loadProgressFromBackend,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
