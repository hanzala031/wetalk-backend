import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { SettingsScreenLayout, SettingsSection, SettingsToggleRow } from '@/components/settings-screen-layout';
import { useLanguage } from '@/context/language-context';
import { useUserSettings } from '@/hooks/use-user-progress';

export default function PrivacySecurityScreen() {
  const { t } = useLanguage();
  const { settings, saveSettings } = useUserSettings();
  const [showProfile, setShowProfile] = useState(true);
  const [shareProgress, setShareProgress] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setShowProfile(settings.privacySettings?.showProfile ?? true);
    setShareProgress(settings.privacySettings?.shareProgress ?? true);
    setAnalyticsEnabled(settings.privacySettings?.analyticsEnabled ?? true);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveSettings({
      privacySettings: {
        showProfile,
        shareProgress,
        analyticsEnabled,
      },
    });
    setIsSaving(false);
    Alert.alert(t('save'), ok ? 'Privacy settings updated.' : 'Could not save settings.');
  };

  return (
    <SettingsScreenLayout 
      title={t('privacy_security')} 
      onSave={handleSave}
      saving={isSaving}
    >
      <Text style={styles.description}>
        Control how your profile and learning progress are shared inside WeTalk.
      </Text>
      <SettingsSection title="Profile & Progress">
        <SettingsToggleRow
          title="Show profile to others"
          subtitle="Display your name and avatar in leaderboards and achievements."
          value={showProfile}
          onValueChange={setShowProfile}
        />
        <SettingsToggleRow
          title="Share learning progress"
          subtitle="Allow progress stats to appear in your profile summary."
          value={shareProgress}
          onValueChange={setShareProgress}
        />
        <SettingsToggleRow
          title="Usage analytics"
          subtitle="Help improve the app with anonymous learning analytics."
          value={analyticsEnabled}
          onValueChange={setAnalyticsEnabled}
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
  note: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
    paddingHorizontal: 4,
  },
});
