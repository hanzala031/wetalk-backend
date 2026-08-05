import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiClient, logApiError } from '@/lib/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY_BLUE = '#004D73';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#4B5563';
const TEXT_LIGHT = '#9CA3AF';
const BG_WHITE = '#FFFFFF';
const DIVIDER = '#F3F4F6';
const CHIP_BG = '#F3F4F6';

type FilterCategory = 'All' | 'Updates' | 'Lessons' | 'Reminders' | 'System';
const FILTER_CHIPS: FilterCategory[] = ['All', 'Updates', 'Lessons', 'Reminders', 'System'];

interface NotificationItem {
  id: string;
  category: 'Updates' | 'Lessons' | 'Reminders' | 'System';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiClient.get('/user/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      logApiError('fetchNotifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;

    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              await apiClient.delete('/user/notifications', {
                headers: { Authorization: `Bearer ${token}` },
              });
              setNotifications([]);
            } catch (error) {
              logApiError('clearNotifications', error);
            }
          },
        },
      ]
    );
  };

  const handlePressNotification = async (item: NotificationItem) => {
    if (item.isRead) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      await apiClient.put(`/user/notifications/${item.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      logApiError('markNotificationRead', error);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'All') return notifications;
    return notifications.filter(n => n.category === activeFilter);
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationItem[] } = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filteredNotifications.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      if (itemDate >= today) {
        groups.Today.push(item);
      } else if (itemDate >= yesterday) {
        groups.Yesterday.push(item);
      } else {
        groups.Older.push(item);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const getIconConfig = (category: string) => {
    switch (category) {
      case 'Lessons': 
        return { name: 'book' as const, color: '#10B981', bg: '#D1FAE5' };
      case 'Reminders': 
        return { name: 'alarm' as const, color: '#F59E0B', bg: '#FEF3C7' };
      case 'System': 
        return { name: 'settings' as const, color: '#8B5CF6', bg: '#EDE9FE' };
      default: 
        return { name: 'notifications' as const, color: '#3B82F6', bg: '#DBEAFE' };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleClearAll} disabled={notifications.length === 0}>
              <Text style={[styles.clearText, notifications.length === 0 && { color: TEXT_LIGHT }]}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersWrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
            >
                {FILTER_CHIPS.map((chip) => (
                    <TouchableOpacity
                        key={chip}
                        style={[styles.chip, activeFilter === chip && styles.activeChip]}
                        onPress={() => setActiveFilter(chip)}
                    >
                        <Text style={[styles.chipText, activeFilter === chip && styles.activeChipText]}>
                            {chip}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* Notification List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={PRIMARY_BLUE} />
            </View>
          ) : filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="notifications-off-outline" size={64} color={TEXT_LIGHT} />
              </View>
              <Text style={styles.emptyStateTitle}>No {activeFilter === 'All' ? '' : activeFilter.toLowerCase()} notifications</Text>
              <Text style={styles.emptyStateText}>
                We&apos;ll notify you when something important happens.
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {Object.entries(groupedNotifications).map(([groupName, items]) => {
                if (items.length === 0) return null;
                return (
                  <View key={groupName} style={styles.section}>
                    <Text style={styles.sectionTitle}>{groupName}</Text>
                    {items.map((item) => {
                      const icon = getIconConfig(item.category);
                      return (
                        <TouchableOpacity 
                          key={item.id} 
                          style={[styles.notificationItem, !item.isRead && styles.unreadItem]} 
                          activeOpacity={0.6}
                          onPress={() => handlePressNotification(item)}
                        >
                          <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
                              <Ionicons name={icon.name} size={24} color={icon.color} />
                            </View>
                            {!item.isRead && <View style={styles.unreadBadge} />}
                          </View>
                          
                          <View style={styles.itemBody}>
                            <View style={styles.itemHeader}>
                              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                              <Text style={styles.itemTime}>{item.time}</Text>
                            </View>
                            <Text style={styles.itemDescription} numberOfLines={2}>
                              {item.description}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_WHITE,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BG_WHITE,
  },
  headerLeft: {
    width: 80,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
  },
  clearText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: PRIMARY_BLUE,
  },
  filtersWrapper: {
    backgroundColor: BG_WHITE,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CHIP_BG,
  },
  activeChip: {
    backgroundColor: PRIMARY_BLUE,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: TEXT_GRAY,
  },
  activeChipText: {
    color: BG_WHITE,
    fontFamily: 'Nunito-Bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  listContainer: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_LIGHT,
    paddingHorizontal: 20,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  unreadItem: {
    backgroundColor: '#F9FAFB',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: BG_WHITE,
  },
  itemBody: {
    flex: 1,
    justifyContent: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
    flex: 1,
    marginRight: 8,
  },
  itemTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: TEXT_LIGHT,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100, // Offset to account for header/filters
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
});
