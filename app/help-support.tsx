import React from 'react';
import { Text, StyleSheet, Linking } from 'react-native';
import { SettingsScreenLayout, SettingsSection, SettingsLinkRow } from '@/components/settings-screen-layout';
import { useLanguage } from '@/context/language-context';

const FAQ_ITEMS = [
  {
    title: 'How do I continue my streak?',
    subtitle: 'Complete at least one lesson or hit your daily XP goal every day.',
  },
  {
    title: 'Why is my progress not syncing?',
    subtitle: 'Make sure backend is running and your phone is on the same Wi-Fi network.',
  },
  {
    title: 'How do I change my learning goal?',
    subtitle: 'Open Settings → Account Settings → Learning Goal and save your changes.',
  },
  {
    title: 'Can I use WeTalk offline?',
    subtitle: 'Some lessons work offline, but AI tutor and sync need an internet connection.',
  },
];

export default function HelpSupportScreen() {
  const { t } = useLanguage();

  return (
    <SettingsScreenLayout title={t('help_support')}>
      <Text style={styles.description}>
        Find answers to common questions or reach out to our support team for further assistance.
      </Text>

      <SettingsSection title="Frequently Asked Questions">
        {FAQ_ITEMS.map((item, index) => (
          <SettingsLinkRow
            key={item.title}
            title={item.title}
            subtitle={item.subtitle}
            isLast={index === FAQ_ITEMS.length - 1}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="Contact Us">
        <SettingsLinkRow
          title="Email Support"
          subtitle="support@wetalk.app"
          onPress={() => Linking.openURL('mailto:support@wetalk.app')}
        />
        <SettingsLinkRow
          title="Follow us on Twitter"
          subtitle="@wetalk_app"
          onPress={() => Linking.openURL('https://twitter.com/wetalk_app')}
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
