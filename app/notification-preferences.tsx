import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { SettingsScreenLayout, SettingsSection, SettingsToggleRow } from '@/components/settings-screen-layout';
import { useLanguage } from '@/context/language-context';
import { useUserSettings } from '@/hooks/use-user-progress';

export default function NotificationPreferencesScreen() {
  const { t } = useLanguage();
  const { settings, saveSettings } = useUserSettings();
  const [lessonReminders, setLessonReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setLessonReminders(settings.notificationPrefs?.lessonReminders ?? true);
    setStreakAlerts(settings.notificationPrefs?.streakAlerts ?? true);
    setAchievementAlerts(settings.notificationPrefs?.achievementAlerts ?? true);
    setWeeklyReport(settings.notificationPrefs?.weeklyReport ?? true);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveSettings({
      notificationPrefs: {
        lessonReminders,
        streakAlerts,
        achievementAlerts,
        weeklyReport,
      },
    });
    setIsSaving(false);
    Alert.alert(t('save'), ok ? 'Notification preferences updated.' : 'Could not save preferences.');
  };

  return (
    <SettingsScreenLayout 
      title={t('notification_preferences')} 
      onSave={handleSave}
      saving={isSaving}
    >
      <Text style={styles.description}>
        Choose which learning updates you want to receive in the app.
      </Text>
      <SettingsSection>
        <SettingsToggleRow
          title={t('lesson_reminders')}
          subtitle={t('lesson_reminders_desc')}
          value={lessonReminders}
          onValueChange={setLessonReminders}
        />
        <SettingsToggleRow
          title={t('streak_alerts')}
          subtitle={t('streak_alerts_desc')}
          value={streakAlerts}
          onValueChange={setStreakAlerts}
        />
        <SettingsToggleRow
          title={t('achievement_alerts')}
          subtitle={t('achievement_alerts_desc')}
          value={achievementAlerts}
          onValueChange={setAchievementAlerts}
        />
        <SettingsToggleRow
          title={t('weekly_report')}
          subtitle={t('weekly_report_desc')}
          value={weeklyReport}
          onValueChange={setWeeklyReport}
          isLast
        />
      </SettingsSection>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
});
