import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const NAVY_DARK = '#004D73';
const HEADING_COLOR = '#0F172A';
const BG_COLOR = '#F5F8FF';
const LIGHT_BLUE = '#EDF4FF';
const WHITE = '#FFFFFF';
const TEXT_GRAY = '#6B7280';

export default function UnlimitedTalkIntroScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />
      
      <View style={[styles.safeTop, { paddingTop: insets.top || 15 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color={NAVY_DARK} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">Unlimited AI Talk</Text>
          </View>

          <View style={styles.headerRight} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.mainCard, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Top Hero Section (Text Left, Image Right) */}
          <View style={styles.heroRow}>
            {/* Left Content */}
            <View style={styles.heroLeft}>
              <View style={styles.titleContainer}>
                <Text style={styles.sparkleIconLeft}>✦</Text>
                <Text style={styles.sparkleIconRight}>✦</Text>
                <Text style={styles.heroTitle}>Unlimited{'\n'}AI Talk</Text>
              </View>
              <View style={styles.titleUnderline} />
              <Text style={styles.heroDescription}>
                {'Master natural conversation\nwith real-time feedback from\nour advanced AI tutor.'}
              </Text>
            </View>

            {/* Right Content (Robot Image) */}
            <View style={styles.heroRight}>
              <Image 
                source={{ uri: 'https://res.cloudinary.com/dgedsmawq/image/upload/v1782210908/bg_robo_dance_sjq1hr.png' }} 
                style={styles.robotIllustration}
                contentFit="contain"
              />
            </View>
          </View>

          {/* Features Horizontal Row */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="infinity" size={20} color={NAVY_DARK} />
              <Text style={styles.featureLabel}>Unlimited{"\n"}Conversations</Text>
            </View>
            <View style={styles.featureSeparator} />
            <View style={styles.featureItem}>
              <Ionicons name="flash-outline" size={16} color={NAVY_DARK} />
              <Text style={styles.featureLabel}>Real-time{"\n"}Feedback</Text>
            </View>
            <View style={styles.featureSeparator} />
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="shield-star-outline" size={16} color={NAVY_DARK} />
              <Text style={styles.featureLabel}>Advanced{"\n"}AI Tutor</Text>
            </View>
          </View>

          {/* Start Session Button */}
          <TouchableOpacity 
            style={styles.startSessionBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/unlimited-talk')}
          >
            <Text style={styles.startSessionText}>Speak with AI</Text>
            <View style={styles.startArrowCircle}>
              <Ionicons name="chevron-forward" size={16} color={WHITE} />
            </View>
          </TouchableOpacity>

          {/* View Session Logs */}
          <TouchableOpacity 
            style={styles.viewLogsBtn}
            activeOpacity={0.8}
          >
            <View style={styles.viewLogsLeft}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={18} color="#4B5563" />
              <Text style={styles.viewLogsText}>View Session Logs</Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color="#9CA3AF" 
              style={{ position: 'absolute', right: 16 }} 
            />
          </TouchableOpacity>

          {/* Feature Card 1: Practice Anytime */}
          <View style={styles.featureCard}>
            <View style={styles.featureCardIconContainer}>
              <MaterialCommunityIcons name="target" size={22} color={NAVY_DARK} />
            </View>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureCardTitle}>Practice Anytime, Anywhere</Text>
              <Text style={styles.featureCardDesc}>
                Speak naturally, get instant feedback, and improve every day.
              </Text>
              <View style={styles.featureCardUnderline} />
            </View>
          </View>

          {/* Feature Card 2: Safe & Private */}
          <View style={styles.featureCard}>
            <View style={styles.featureCardIconContainer}>
              <MaterialCommunityIcons name="shield-check" size={22} color={NAVY_DARK} />
            </View>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureCardTitle}>Safe & Private</Text>
              <Text style={styles.featureCardDesc}>
                Your conversations are secure and never shared.
              </Text>
            </View>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color={NAVY_DARK} />
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  safeTop: {
    backgroundColor: BG_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 64,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Nunito-Bold',
    color: NAVY_DARK,
    textAlign: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  premiumText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: NAVY_DARK,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  mainCard: {
    backgroundColor: WHITE,
    borderRadius: 32,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  heroLeft: {
    flex: 1.4,
    paddingRight: 2,
  },
  heroRight: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  robotIllustration: {
    width: 290,
    height: 250,
    marginRight: -15,
    marginTop: -25,
    marginBottom: -25,
    transform: [
      { scale: 1.35 },
      { translateX: -18 },
    ],
  },
  sparkleIconLeft: {
    position: 'absolute',
    left: -14,
    top: -4,
    fontSize: 12,
    color: '#93C5FD',
  },
  sparkleIconRight: {
    position: 'absolute',
    right: 10,
    bottom: 12,
    fontSize: 14,
    color: '#93C5FD',
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: HEADING_COLOR,
    textAlign: 'left',
    lineHeight: 34,
  },
  titleUnderline: {
    width: 24,
    height: 3,
    backgroundColor: NAVY_DARK,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    textAlign: 'left',
    lineHeight: 16,
    marginTop: 6,
  },
  featuresRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 9.5,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginLeft: 5,
    lineHeight: 12,
  },
  featureSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
  },
  startSessionBtn: {
    backgroundColor: NAVY_DARK,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: NAVY_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  startSessionText: {
    color: WHITE,
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    marginRight: 8,
  },
  startArrowCircle: {
    position: 'absolute',
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewLogsBtn: {
    backgroundColor: '#EDF4FF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 24,
    position: 'relative',
  },
  viewLogsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewLogsText: {
    color: '#4B5563',
    fontFamily: 'Inter-Medium',
    fontSize: 13.5,
    marginLeft: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 14,
  },
  featureCardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  featureCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureCardTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: HEADING_COLOR,
  },
  featureCardDesc: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    color: TEXT_GRAY,
    lineHeight: 16,
    marginTop: 2,
  },
  featureCardUnderline: {
    width: 20,
    height: 2,
    backgroundColor: NAVY_DARK,
    borderRadius: 1,
    marginTop: 6,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EDF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
