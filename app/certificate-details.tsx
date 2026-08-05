import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

// Colors from the image
const ACCENT_NAVY = '#004D73'; 
const BACKGROUND_LIGHT = '#F8FAFC';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const SUCCESS_GREEN = '#10B981';
const BORDER_COLOR = '#F1F5F9';

export default function CertificateDetailsScreen() {
  const { title = 'Beginner English Mastery' } = useLocalSearchParams<{ title: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Certificate Main Card */}
        <View style={styles.certMainCard}>
          <View style={styles.certHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="school" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.certTypeLabel}>PROFESSIONAL CERTIFICATE</Text>
            <Text style={styles.certTitle}>{title}</Text>
            <Text style={styles.certDescription}>
              This document certifies that the individual has successfully completed the foundational English course.
            </Text>
          </View>

          <View style={styles.certDetailsRow}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color={TEXT_SECONDARY} />
                <Text style={styles.detailLabel}>CERTIFICATE ID</Text>
              </View>
              <Text style={styles.detailValue}>ME-2023-BEM</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconRow}>
                <Ionicons name="calendar-outline" size={16} color={TEXT_SECONDARY} />
                <Text style={styles.detailLabel}>ISSUED DATE</Text>
              </View>
              <Text style={styles.detailValue}>Oct 12, 2023</Text>
            </View>
          </View>

          <View style={styles.issuerRow}>
             <Ionicons name="ribbon-outline" size={20} color={TEXT_SECONDARY} />
             <View>
               <Text style={styles.detailLabel}>ISSUER</Text>
               <Text style={styles.detailValue}>Master English Academy</Text>
             </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={20} color={TEXT_PRIMARY} />
              <Text style={styles.shareButtonText}>Share Achievement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.downloadButtonText}>Download Certificate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Course Highlights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Course Highlights</Text>
          <View style={styles.completeBadge}>
            <Text style={styles.completeBadgeText}>100% COMPLETE</Text>
          </View>
        </View>

        <View style={styles.highlightsList}>
          <HighlightItem 
            icon="chatbubble-outline" 
            title="Basic Greetings" 
            desc="Mastered essential social introductions" 
          />
          <HighlightItem 
            icon="chatbubbles-outline" 
            title="Common Phrases" 
            desc="Daily expressions and idioms" 
          />
          <HighlightItem 
            icon="reorder-three-outline" 
            title="Sentence Structure" 
            desc="Grammar fundamentals and syntax" 
          />
        </View>

        {/* Performance Section */}
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>MASTERY LEVEL</Text>
          <Text style={styles.masteryValue}>100%</Text>
          <View style={styles.performanceStats}>
            <View style={styles.perfStatItem}>
              <Text style={styles.perfStatLabel}>Status</Text>
              <Text style={styles.perfStatValue}>Completed</Text>
            </View>
            <View style={styles.perfProgressBarContainer}>
              <View style={[styles.perfProgressBar, { width: '100%' }]} />
            </View>
            <View style={styles.perfStatItem}>
              <Text style={styles.perfStatLabel}>Modules Passed</Text>
              <Text style={styles.perfStatValue}>12/12</Text>
            </View>
          </View>
        </View>

        {/* Skills Earned */}
        <View style={styles.skillsCard}>
          <Text style={styles.detailLabel}>Skills Earned</Text>
          <View style={styles.skillsContainer}>
            <View style={styles.skillPill}><Text style={styles.skillText}>COMMUNICATION</Text></View>
            <View style={styles.skillPill}><Text style={styles.skillText}>GRAMMAR</Text></View>
            <View style={styles.skillPill}><Text style={styles.skillText}>VOCABULARY</Text></View>
          </View>

          <Text style={styles.readyTitle}>Ready for more?</Text>
          <Text style={styles.readyDesc}>
            Take your English to the next level with our Intermediate course.
          </Text>

          <TouchableOpacity style={styles.nextCourseButton}>
            <Text style={styles.nextCourseText}>Start Next Course</Text>
            <Ionicons name="chevron-forward" size={18} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const HighlightItem = ({ icon, title, desc }: any) => (
  <View style={styles.highlightItem}>
    <View style={styles.highlightIconBox}>
      <Ionicons name={icon} size={22} color={TEXT_SECONDARY} />
    </View>
    <View style={styles.highlightTextContainer}>
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightDesc}>{desc}</Text>
    </View>
    <Ionicons name="checkmark-circle" size={22} color={SUCCESS_GREEN} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },
  topHeader: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  certMainCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  certHeader: {
    backgroundColor: ACCENT_NAVY,
    marginHorizontal: -20,
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  certTypeLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  certTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    textAlign: 'center',
    marginBottom: 15,
  },
  certDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  certDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 25,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  detailItem: {
    flex: 1,
  },
  detailIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: TEXT_SECONDARY,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  issuerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  actionButtons: {
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    gap: 10,
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 12,
    backgroundColor: ACCENT_NAVY,
    gap: 10,
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  completeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completeBadgeText: {
    fontSize: 10,
    fontFamily: 'Nunito-ExtraBold',
    color: SUCCESS_GREEN,
  },
  highlightsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  highlightIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  highlightTextContainer: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  highlightDesc: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
  },
  performanceCard: {
    backgroundColor: ACCENT_NAVY,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  performanceLabel: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  masteryValue: {
    fontSize: 48,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  performanceStats: {
    gap: 10,
  },
  perfStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  perfStatLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  perfStatValue: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  perfProgressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginVertical: 5,
  },
  perfProgressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  skillsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 25,
  },
  skillPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 10,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_SECONDARY,
  },
  readyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  readyDesc: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 25,
  },
  nextCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: TEXT_PRIMARY,
    gap: 10,
  },
  nextCourseText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
});
