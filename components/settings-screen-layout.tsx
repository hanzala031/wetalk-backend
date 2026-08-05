import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MotiView } from 'moti';

const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const WHITE = '#FFFFFF';
const BG = '#F9FAFB';
const ACCENT = '#004D73';

interface SettingsScreenLayoutProps {
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  saving?: boolean;
}

export function SettingsScreenLayout({
  title,
  children,
  onSave,
  saveLabel = 'Save',
  saving = false,
}: SettingsScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>
        {onSave ? (
          <TouchableOpacity onPress={onSave} style={styles.headerButton} disabled={saving}>
            <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>{saveLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SettingsSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function SettingsToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
  isLast = false,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.toggle, value && styles.toggleActive]}>
        <MotiView
          animate={{
            translateX: value ? 20 : 0,
          }}
          transition={{
            type: 'timing',
            duration: 200,
          }}
          style={styles.toggleKnob}
        />
      </View>
    </TouchableOpacity>
  );
}

export function SettingsLinkRow({
  title,
  subtitle,
  onPress,
  isLast = false,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity 
      style={[styles.row, !isLast && styles.rowBorder]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: WHITE,
  },
  headerButton: { 
    paddingVertical: 2, 
    paddingHorizontal: 4,
    justifyContent: 'center',
    minWidth: 60,
  },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: ACCENT,
    textAlign: 'right',
  },
  saveTextDisabled: { opacity: 0.5 },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_SECONDARY,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowTextWrap: { flex: 1, paddingRight: 12 },
  rowTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: TEXT_PRIMARY,
  },
  rowSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    marginTop: 2,
    lineHeight: 16,
  },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    paddingVertical: 2,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: '#004D73' },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
});
