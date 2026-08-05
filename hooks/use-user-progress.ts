import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/auth-context';
import { apiClient, authConfig, isNetworkError, logApiError } from '@/lib/api-client';
import { ProgressData } from '@/lib/progress-utils';

export interface StreakData {
  currentStreak: number;
  todayXpEarned: number;
  dailyXpTarget: number;
  weeklyProgress?: Array<{ dayName: string; dateString: string; goalAchieved: boolean }>;
}

export interface UserSettings {
  learningGoal: string;
  targetLanguage: string;
  notificationPrefs: {
    lessonReminders?: boolean;
    streakAlerts?: boolean;
    achievementAlerts?: boolean;
    weeklyReport?: boolean;
  };
  privacySettings: {
    showProfile?: boolean;
    shareProgress?: boolean;
    analyticsEnabled?: boolean;
  };
}

export function useUserProgress() {
  const { userToken } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!userToken) {
      setProgressData({});
      setStreakData({ currentStreak: 0, todayXpEarned: 0, dailyXpTarget: 50 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const config = authConfig(userToken, { timeout: 10000 });
      const [streakRes, syncRes] = await Promise.all([
        apiClient.get('/streak/status', config),
        apiClient.get('/user/sync', config),
      ]);

      if (streakRes.data?.success) {
        setStreakData(streakRes.data.data);
      }
      if (syncRes.data?.success) {
        setProgressData(syncRes.data.progressData || {});
      } else {
        setProgressData({});
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        logApiError('Error fetching user progress', error);
      }
      setProgressData({});
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [fetchProgress])
  );

  return {
    progressData,
    streakData,
    streakCount: streakData?.currentStreak || 0,
    loading,
    refresh: fetchProgress,
  };
}

export function useUserSettings() {
  const { userToken } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!userToken) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/user/settings', authConfig(userToken));
      if (response.data?.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        logApiError('Error fetching user settings', error);
      }
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  const saveSettings = useCallback(async (partial: Partial<UserSettings>) => {
    if (!userToken) return false;
    try {
      const response = await apiClient.put('/user/settings', partial, authConfig(userToken));
      if (response.data?.success) {
        setSettings(response.data.settings);
        return true;
      }
    } catch (error) {
      if (!isNetworkError(error)) {
        logApiError('Error saving user settings', error);
      }
    }
    return false;
  }, [userToken]);

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings])
  );

  return { settings, loading, saveSettings, refresh: fetchSettings };
}
