import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsScreenLayout, SettingsSection } from '@/components/settings-screen-layout';
import { useLanguage } from '@/context/language-context';
import { useUserSettings } from '@/hooks/use-user-progress';

const APP_LANGUAGES = ['English', 'Urdu'];
const LEARNING_LANGUAGES = ['English', 'Spanish', 'Japanese', 'Chinese', 'Arabic', 'Hindi'];

export default function LanguageSettingsScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { settings, saveSettings } = useUserSettings();
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [appLanguage, setAppLanguage] = useState(language);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings?.targetLanguage) {
      setTargetLanguage(settings.targetLanguage);
    }
  }, [settings]);

  useEffect(() => {
    setAppLanguage(language);
  }, [language]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setLanguage(appLanguage);
      const ok = await saveSettings({ targetLanguage });
      if (ok) {
        Alert.alert(t('save'), 'Language settings updated.');
      } else {
        Alert.alert('Error', 'Could not save language settings.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsScreenLayout 
      title={t('language_settings')} 
      onSave={handleSave}
      saving={isSaving}
    >
      <SettingsSection title="App Language">
        {APP_LANGUAGES.map((lang, index) => (
          <LanguageOption
            key={lang}
            label={lang}
            selected={appLanguage === lang}
            onPress={() => setAppLanguage(lang)}
            isLast={index === APP_LANGUAGES.length - 1}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="Language You Are Learning">
        {LEARNING_LANGUAGES.map((lang, index) => (
          <LanguageOption
            key={lang}
            label={lang}
            selected={targetLanguage === lang}
            onPress={() => setTargetLanguage(lang)}
            isLast={index === LEARNING_LANGUAGES.length - 1}
          />
        ))}
      </SettingsSection>
    </SettingsScreenLayout>
  );
}

function LanguageOption({
  label,
  selected,
  onPress,
  isLast,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.option, !isLast && styles.optionBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
      {selected ? <Ionicons name="checkmark-circle" size={22} color="#004D73" /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#111827',
  },
  optionTextSelected: {
    color: '#004D73',
  },
});
