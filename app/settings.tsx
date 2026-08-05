import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useUserSettings } from '@/hooks/use-user-progress';
import { Image } from 'expo-image';
import { apiClient, authConfig } from '@/lib/api-client';

const BACKGROUND_COLOR = '#F9FAFB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const ACCENT_BLUE = '#004D73';
const WHITE = '#FFFFFF';
const ERROR_RED = '#991B1B';

export default function SettingsScreen() {
  const { userName, userAvatar, userEmail, signOut, userToken } = useAuth();
  const { t, language } = useLanguage();
  const { settings } = useUserSettings();

  const avatarUri =
    userAvatar && userAvatar !== 'default-avatar.png'
      ? userAvatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=004D73&color=fff`;

  const learningLanguage = settings?.targetLanguage || 'English';

  const handleLogout = () => {
    signOut();
    router.replace('/sign-in');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account'),
      'This will permanently delete your account and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('delete_account'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (userToken) {
                await apiClient.delete('/user/account', authConfig(userToken));
              }
              await signOut();
              router.replace('/sign-in');
            } catch {
              Alert.alert('Error', 'Could not delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName || 'User'}</Text>
            <Text style={styles.profileLevel}>{learningLanguage} Learner</Text>
            {userEmail ? <Text style={styles.profileEmail}>{userEmail}</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingItem
              icon={<Feather name="user" size={20} color={TEXT_PRIMARY} />}
              title={t('account_settings')}
              onPress={() => router.push('/edit-profile')}
            />
            <SettingItem
              icon={<Feather name="shield" size={20} color={TEXT_PRIMARY} />}
              title={t('privacy_security')}
              onPress={() => router.push('/privacy-security')}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingItem
              icon={<Ionicons name="notifications-outline" size={22} color={TEXT_PRIMARY} />}
              title={t('notification_preferences')}
              onPress={() => router.push('/notification-preferences')}
            />
            <SettingItem
              icon={<Ionicons name="globe-outline" size={22} color={TEXT_PRIMARY} />}
              title={t('language_settings')}
              subtitle={language}
              onPress={() => router.push('/language-settings')}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & About</Text>
          <View style={styles.card}>
            <SettingItem
              icon={<Ionicons name="help-circle-outline" size={22} color={TEXT_PRIMARY} />}
              title={t('help_support')}
              subtitle={t('faq_contact')}
              onPress={() => router.push('/help-support')}
            />
            <SettingItem
              icon={<Ionicons name="information-circle-outline" size={22} color={TEXT_PRIMARY} />}
              title="About WeTalk"
              subtitle="v1.0.0"
              isLast
            />
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={ERROR_RED} />
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>{t('delete_account')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingItem = ({ icon, title, subtitle, isLast, onPress }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.settingItem, !isLast && styles.settingItemBorder]}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingItemLeft}>
      <View style={styles.iconBox}>{icon}</View>
      <View>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    {onPress && <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: WHITE,
  },
  headerButton: { 
    paddingVertical: 2, 
    paddingHorizontal: 4,
    justifyContent: 'center',
    minWidth: 40,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito-Bold', color: TEXT_PRIMARY },
  scrollContent: { paddingBottom: 60 },
  profileCard: {
    backgroundColor: ACCENT_BLUE,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarContainer: { marginRight: 20 },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: WHITE,
    marginBottom: 2,
  },
  profileLevel: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: { fontSize: 16, fontFamily: 'Nunito-SemiBold', color: TEXT_PRIMARY },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  actionSection: { marginTop: 40, paddingHorizontal: 20, gap: 16 },
  logoutButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: WHITE,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoutButtonText: { fontSize: 16, fontFamily: 'Nunito-Bold', color: ERROR_RED },
  deleteButton: { alignItems: 'center', paddingVertical: 10 },
  deleteButtonText: { fontSize: 14, fontFamily: 'Nunito-SemiBold', color: TEXT_SECONDARY },
});

