import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, authConfig, isNetworkError, logApiError } from '@/lib/api-client';

const resolveLocalUrl = (url: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') && !url.startsWith('https://')) {
    try {
      const activeBase = apiClient.defaults.baseURL || '';
      if (activeBase) {
        const apiMatch = activeBase.match(/^(http:\/\/[^\/]+)/);
        if (apiMatch) {
          const newOrigin = apiMatch[1];
          const cleanPath = url.replace(/^http:\/\/[^\/]+/, '');
          return `${newOrigin}${cleanPath}`;
        }
      }
    } catch (e) {
      console.warn('Failed to resolve local URL origin:', e);
    }
  }
  return url;
};

interface AuthContextType {
  isNewUser: boolean | null;
  userToken: string | null;
  userName: string | null;
  userAvatar: string | null;
  userEmail: string | null;
  isProfileCompleted: boolean | null;
  completeOnboarding: () => Promise<void>;
  setUserData: (name: string, avatar: string, email?: string, isProfileCompleted?: boolean) => Promise<void>;
  signIn: (token: string, user: any, skipRedirect?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  initializeNewUser: () => Promise<void>;
  syncProgressToBackend: (tokenOverride?: string) => Promise<void>;
  loadProgressFromBackend: (tokenOverride?: string) => Promise<void>;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadState() {
      try {
        const newUserVal = await SecureStore.getItemAsync('isNewUser');
        const token = await SecureStore.getItemAsync('userToken');
        let name = await SecureStore.getItemAsync('userName');
        let avatar = await SecureStore.getItemAsync('userAvatar');
        let email = await SecureStore.getItemAsync('userEmail');
        const isProfileCompletedVal = await SecureStore.getItemAsync('isProfileCompleted');
        let isProfileCompletedBool = isProfileCompletedVal === 'true';

        if (avatar === 'default-avatar.png') {
          avatar = '';
        }

        // ── Step 1: Validate token structure locally (no network needed) ──────
        if (token) {
          let tokenIsInvalid = false;
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(
                typeof atob !== 'undefined'
                  ? atob(payloadB64)
                  : Buffer.from(payloadB64, 'base64').toString('utf-8')
              );
              // Check expiration if exp field is present in token payload
              if (payload.exp && Date.now() >= payload.exp * 1000) {
                tokenIsInvalid = true;
                console.log('Client-side: token has expired, clearing auth state...');
              }
            } else {
              tokenIsInvalid = true;
            }
          } catch {
            tokenIsInvalid = true;
          }

          if (tokenIsInvalid) {
            await Promise.all([
              SecureStore.deleteItemAsync('userToken'),
              SecureStore.deleteItemAsync('userName'),
              SecureStore.deleteItemAsync('userAvatar'),
              SecureStore.deleteItemAsync('userEmail'),
              SecureStore.deleteItemAsync('isProfileCompleted'),
            ]);
            setIsNewUser(false);
            setUserToken(null);
            setUserName(null);
            setUserAvatar(null);
            setUserEmail(null);
            setIsProfileCompleted(false);
            setIsLoading(false);
            return;
          }
        }

        // ── Step 2: Fetch latest profile from backend if token is valid ──────
        if (token) {
          try {
            const response = await apiClient.get('/auth/me', authConfig(token, { timeout: 5000 }));
            if (response.data && response.data.success && response.data.user) {
              const u = response.data.user;
              name = u.name || '';
              avatar = u.profileImage || '';
              email = u.email || '';
              isProfileCompletedBool = u.isProfileCompleted === true || u.isProfileCompleted === 'true';
              if (avatar === 'default-avatar.png') {
                avatar = '';
              }
              // Resolve local server URLs with current backend host
              if (avatar && avatar.startsWith('http://') && !avatar.startsWith('https://')) {
                avatar = resolveLocalUrl(avatar);
              }
              // Keep local storage in sync with latest backend data
              await Promise.all([
                SecureStore.setItemAsync('userName', name || ''),
                SecureStore.setItemAsync('userAvatar', avatar || ''),
                SecureStore.setItemAsync('userEmail', email || ''),
                SecureStore.setItemAsync('isProfileCompleted', String(isProfileCompletedBool)),
              ]);
            }
          } catch (apiErr: any) {
            // 401 = token is invalid/expired on backend → force re-login
            const status = apiErr?.response?.status;
            if (status === 401) {
              console.log('Backend: stale token detected, clearing auth state...');
              await Promise.all([
                SecureStore.deleteItemAsync('userToken'),
                SecureStore.deleteItemAsync('userName'),
                SecureStore.deleteItemAsync('userAvatar'),
                SecureStore.deleteItemAsync('userEmail'),
                SecureStore.deleteItemAsync('isProfileCompleted'),
              ]);
              setIsNewUser(false);
              setUserToken(null);
              setUserName(null);
              setUserAvatar(null);
              setUserEmail(null);
              setIsProfileCompleted(false);
              setIsLoading(false);
              return;
            } else if (!isNetworkError(apiErr)) {
              logApiError('Failed to fetch user profile on app load', apiErr);
            }
            // Network error: use the cached SecureStore values (offline mode is OK)
          }
        }

        setIsNewUser(newUserVal === null || newUserVal === 'true');
        setUserToken(token);
        setUserName(name);
        setUserAvatar(avatar);
        setUserEmail(email);
        setIsProfileCompleted(isProfileCompletedBool);
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

  const setUserData = async (name: string, avatar: string, email?: string, isProfileCompletedVal?: boolean) => {
    try {
      let cleanAvatar = avatar || '';
      if (cleanAvatar === 'default-avatar.png') {
        cleanAvatar = '';
      }
      if (cleanAvatar && cleanAvatar.startsWith('http://') && !cleanAvatar.startsWith('https://')) {
        cleanAvatar = resolveLocalUrl(cleanAvatar);
      }
      const finalEmail = email !== undefined ? (email || '') : (userEmail || '');
      const finalIsProfileCompleted = isProfileCompletedVal !== undefined ? isProfileCompletedVal : (isProfileCompleted || false);

      await Promise.all([
        SecureStore.setItemAsync('userName', name),
        SecureStore.setItemAsync('userAvatar', cleanAvatar),
        SecureStore.setItemAsync('userEmail', finalEmail),
        SecureStore.setItemAsync('isProfileCompleted', String(finalIsProfileCompleted)),
      ]);
      setUserName(name);
      setUserAvatar(cleanAvatar);
      setUserEmail(finalEmail);
      setIsProfileCompleted(finalIsProfileCompleted);
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
      const isNewSignup = await AsyncStorage.getItem('is_new_user_signup');
      await AsyncStorage.clear();
      if (isNewSignup) {
        await AsyncStorage.setItem('is_new_user_signup', isNewSignup);
      }
    } catch (e) {
      console.error('Error clearing local progress storage:', e);
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
          // Backend progress is empty for new user: wipe all local leftover keys and set fresh zero stats
          await clearAllLocalProgressKeys();
          const defaultStats = {
            xp: 0,
            coins: 0,
            gems: 10,
            streak: 0,
            lastDate: null,
          };
          await AsyncStorage.setItem('user_stats', JSON.stringify(defaultStats));
          await AsyncStorage.setItem('completed_lessons', JSON.stringify([]));
          await syncProgressToBackend(token);
        }
      } else {
        // Backend response did not contain progressData: initialize fresh defaults
        await clearAllLocalProgressKeys();
        const defaultStats = {
          xp: 0,
          coins: 0,
          gems: 10,
          streak: 0,
          lastDate: null,
        };
        await AsyncStorage.setItem('user_stats', JSON.stringify(defaultStats));
        await AsyncStorage.setItem('completed_lessons', JSON.stringify([]));
        await syncProgressToBackend(token);
      }
    } catch (e: any) {
      // 401 means stale/invalid token — silently skip, the loadState already handles forced logout
      const status = e?.response?.status;
      if (status === 401) {
        console.log('loadProgressFromBackend: 401 received, skipping (stale token).');
        return;
      }
      if (!isNetworkError(e)) {
        console.error('Error loading progress from backend:', e);
      }
    }
  };

  const signIn = async (token: string, user: any, skipRedirect = false) => {
    try {
      // Use the name from backend; never fall back to email prefix
      const name = user.name || '';
      let avatar = user.profileImage || '';
      if (avatar === 'default-avatar.png') {
        avatar = '';
      }
      // Resolve local server URLs that break on different networks/sessions
      if (avatar && avatar.startsWith('http://') && !avatar.startsWith('https://')) {
        avatar = resolveLocalUrl(avatar);
      }
      const email = user.email || '';
      const isCompleted = user.isProfileCompleted === true || user.isProfileCompleted === 'true';
      
      await Promise.all([
        SecureStore.setItemAsync('userToken', token),
        SecureStore.setItemAsync('userName', String(name)),
        SecureStore.setItemAsync('userAvatar', String(avatar)),
        SecureStore.setItemAsync('userEmail', String(email)),
        SecureStore.setItemAsync('isNewUser', 'false'),
        SecureStore.setItemAsync('lastLoggedOutEmail', String(email)),
        SecureStore.setItemAsync('isProfileCompleted', String(isCompleted)),
      ]);
      setUserToken(token);
      setUserName(name);
      setUserAvatar(avatar);
      setUserEmail(email);
      setIsNewUser(false);
      setIsProfileCompleted(isCompleted);

      // CRITICAL: Wipe ALL previous user's local progress before loading this user's data.
      // This prevents one user from seeing another user's lessons/progress.
      await clearAllLocalProgressKeys();

      // Load their progress from backend — this will restore their saved state
      // or set a fresh empty state for a brand new user.
      await loadProgressFromBackend(token);

      if (!skipRedirect) {
        if (!isCompleted) {
          router.replace('/profile-setup');
        } else {
          router.replace('/(tabs)');
        }
      }
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
        SecureStore.deleteItemAsync('isProfileCompleted'),
        clearAllLocalProgressKeys()
      ]);
      setUserToken(null);
      setUserName(null);
      setUserAvatar(null);
      setUserEmail(null);
      setIsProfileCompleted(false);
      router.replace('/sign-in');
    } catch (e) {
      console.error('Error during sign out', e);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token, user } = response.data;
      await signIn(token, user);
    }
    return response.data;
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await apiClient.post('/auth/signup', { name, email, password });
    if (response.data.success) {
      const { token, user } = response.data;
      await signIn(token, user);
    }
    return response.data;
  };

  const logout = async () => {
    await signOut();
  };

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        const response = await apiClient.get('/auth/me', authConfig(token, { timeout: 5000 }));
        if (response.data && response.data.success && response.data.user) {
          const u = response.data.user;
          const name = u.name || '';
          let avatar = u.profileImage || '';
          const email = u.email || '';
          const isCompleted = u.isProfileCompleted === true || u.isProfileCompleted === 'true';
          if (avatar === 'default-avatar.png') {
            avatar = '';
          }
          if (avatar && avatar.startsWith('http://') && !avatar.startsWith('https://')) {
            avatar = resolveLocalUrl(avatar);
          }
          await Promise.all([
            SecureStore.setItemAsync('userName', name || ''),
            SecureStore.setItemAsync('userAvatar', avatar || ''),
            SecureStore.setItemAsync('userEmail', email || ''),
            SecureStore.setItemAsync('isProfileCompleted', String(isCompleted)),
          ]);
          setUserToken(token);
          setUserName(name);
          setUserAvatar(avatar);
          setUserEmail(email);
          setIsProfileCompleted(isCompleted);
          setIsNewUser(false);
        }
      } else {
        setUserToken(null);
        setUserName(null);
        setUserAvatar(null);
        setUserEmail(null);
        setIsProfileCompleted(false);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        await signOut();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isNewUser, 
      userToken, 
      userName,
      userAvatar,
      userEmail,
      isProfileCompleted,
      completeOnboarding,
      setUserData,
      signIn, 
      signOut, 
      initializeNewUser,
      syncProgressToBackend,
      loadProgressFromBackend,
      isLoading,
      login,
      signup,
      logout,
      checkAuthStatus
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
