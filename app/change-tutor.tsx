import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tutorStore } from '@/lib/tutor-store';

const { width } = Dimensions.get('window');

const NAVY_BLUE = '#004D73';
const TEXT_DARK = '#0F172A';
const TEXT_GRAY = '#64748B';
const BG_COLOR = '#F8FAFC';
const WHITE = '#FFFFFF';

const TABS = ['All Tutors', 'Conversation', 'IELTS', 'Business', 'Grammar'];

const TUTORS = [
  {
    id: 'emma',
    name: 'Emma',
    type: 'English Coach',
    category: 'Conversation',
    voice: 'Warm & Friendly',
    accent: 'American',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    id: 'jack',
    name: 'Jack',
    type: 'IELTS Coach',
    category: 'IELTS',
    voice: 'Calm & Clear',
    accent: 'British',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    type: 'Business Coach',
    category: 'Business',
    voice: 'Professional',
    accent: 'American',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  },
  {
    id: 'john',
    name: 'John',
    type: 'English Coach',
    category: 'Conversation',
    voice: 'Warm & Friendly',
    accent: 'American',
    image: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1782211315/4ebc3ff2-bfbe-4a36-87f5-fbabf837a404_tjihlz.png',
  },
  {
    id: 'grace',
    name: 'Grace',
    type: 'Grammar Coach',
    category: 'Grammar',
    voice: 'Gentle & Patient',
    accent: 'British',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
  },
];

export default function ChangeTutorScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All Tutors');
  const [currentTutor, setCurrentTutor] = useState(tutorStore.getTutor());

  useEffect(() => {
    setCurrentTutor(tutorStore.getTutor());
  }, []);

  const handleSelect = (tutor: any) => {
    tutorStore.setTutor(tutor);
    router.back();
  };

  const filteredTutors = TUTORS.filter((tutor) => {
    if (activeTab === 'All Tutors') return true;
    return tutor.category === activeTab;
  });

  const renderTutorItem = ({ item }: { item: typeof TUTORS[0] }) => {
    const isCurrent = currentTutor.name.toLowerCase() === item.name.toLowerCase();

    return (
      <View style={[styles.tutorCard, isCurrent && styles.tutorCardCurrent]}>
        {/* Left: Avatar with optional Current banner */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.tutorAvatar}
            contentFit="cover"
          />
          {isCurrent && (
            <View style={styles.currentBanner}>
              <Text style={styles.currentBannerText}>Current</Text>
            </View>
          )}
        </View>

        {/* Center: Details */}
        <View style={styles.tutorDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.tutorName}>{item.name}</Text>
          </View>

          <View style={styles.typeRow}>
            <Text style={styles.tutorType}>{item.type}</Text>
            <Ionicons name="sparkles-sharp" size={10} color="#94A3B8" style={{ marginLeft: 4 }} />
          </View>

          <View style={styles.traitItem}>
            <MaterialCommunityIcons name="volume-high" size={13} color="#64748B" style={{ marginRight: 5 }} />
            <Text style={styles.traitText}>Voice: {item.voice}</Text>
          </View>

          <View style={styles.traitItem}>
            <Ionicons name="globe-outline" size={12} color="#64748B" style={{ marginRight: 5, marginTop: 1 }} />
            <Text style={styles.traitText}>Accent: {item.accent}</Text>
          </View>
        </View>

        {/* Right: Select Button / Current Badge */}
        <View style={styles.rightSection}>
          {isCurrent ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current Tutor</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectBtn}
              activeOpacity={0.8}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.selectBtnText}>Select</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={NAVY_BLUE} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Change Tutor</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tutor List */}
      <FlatList
        data={filteredTutors}
        keyExtractor={(item) => item.id}
        renderItem={renderTutorItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_DARK,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    marginTop: 2,
    textAlign: 'center',
  },

  // Tabs
  tabContainer: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabsScrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: NAVY_BLUE,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  tabTextActive: {
    color: TEXT_DARK,
    fontFamily: 'Inter-SemiBold',
  },

  // List
  listContent: {
    padding: 16,
  },
  tutorCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  tutorCardCurrent: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FAFDFE',
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  tutorAvatar: {
    width: '100%',
    height: '100%',
  },
  currentBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: 8,
  },
  currentBannerText: {
    color: WHITE,
    fontSize: 9,
    fontFamily: 'Inter-Bold',
  },
  tutorDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  tutorName: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_DARK,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tutorType: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: TEXT_GRAY,
  },
  traitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  traitText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#475569',
  },
  rightSection: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  selectBtn: {
    backgroundColor: NAVY_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectBtnText: {
    color: WHITE,
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },
  currentBadge: {
    backgroundColor: '#EDF4FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  currentBadgeText: {
    color: NAVY_BLUE,
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
});
