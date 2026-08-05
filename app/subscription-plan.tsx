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
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';

const { width } = Dimensions.get('window');

// Colors from the image
const BACKGROUND_COLOR = '#F9FAFB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const ACCENT_BLUE = '#004D73';
const WHITE = '#FFFFFF';
const BORDER_COLOR = '#E5E7EB';
const SUCCESS_GREEN = '#10B981';

export default function SubscriptionPlanScreen() {
  const { t } = useLanguage();
  const { userAvatar } = useAuth();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('subscription_plan')}</Text>
        <TouchableOpacity style={styles.headerButton}>
          {userAvatar ? (
             <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          ) : (
             <Ionicons name="person-circle-outline" size={32} color="#D1D5DB" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{t('choose_your_plan')}</Text>
          <Text style={styles.subtitle}>
            {t('plan_subtitle')}
          </Text>
        </View>

        {/* Plan: Basic */}
        <View style={styles.planCard}>
          <Text style={styles.planLevelLabel}>{t('entry_level')}</Text>
          <Text style={styles.planName}>{t('basic_plan')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$0</Text>
            <Text style={styles.pricePeriod}> / {t('forever')}</Text>
          </View>

          <View style={styles.featureList}>
            <FeatureItem icon="checkmark-circle-outline" text="Daily vocabulary limit (5)" />
            <FeatureItem icon="checkmark-circle-outline" text="Standard practice sessions" />
            <FeatureItem icon="checkmark-circle-outline" text="Ad-supported experience" />
            <FeatureItem icon="close-circle-outline" text="Official Certificates" isDisabled />
          </View>

          <TouchableOpacity style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>{t('get_started')}</Text>
          </TouchableOpacity>
        </View>

        {/* Plan: Pro Scholar (Best Value) */}
        <View style={styles.bestValueContainer}>
            <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>{t('best_value')}</Text>
            </View>
            <View style={[styles.planCard, styles.proCard]}>
                <Text style={styles.planLevelLabel}>{t('professional')}</Text>
                <Text style={styles.planName}>{t('pro_scholar_plan')}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>$12.99</Text>
                    <Text style={styles.pricePeriod}> / {t('month')}</Text>
                </View>

                <View style={styles.featureList}>
                    <FeatureItem icon="checkmark-circle-outline" text="Ad-free experience" />
                    <FeatureItem icon="checkmark-circle-outline" text="Unlimited Practice Tests" />
                    <FeatureItem icon="checkmark-circle-outline" text="Offline Mode access" />
                    <FeatureItem icon="checkmark-circle-outline" text="Official Certificates" />
                    <FeatureItem icon="checkmark-circle-outline" text="Smart review algorithm" />
                </View>

                <TouchableOpacity style={styles.solidButton}>
                    <Text style={styles.solidButtonText}>{t('subscribe_now')}</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Plan: Academic Master */}
        <View style={styles.planCard}>
          <Text style={styles.planLevelLabel}>{t('enterprise')}</Text>
          <Text style={styles.planName}>{t('academic_master_plan')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$29.99</Text>
            <Text style={styles.pricePeriod}> / {t('month')}</Text>
          </View>

          <View style={styles.featureList}>
            <FeatureItem icon="checkmark-circle-outline" text="Everything in Pro Scholar" />
            <FeatureItem icon="checkmark-circle-outline" text="1-on-1 tutoring sessions" />
            <FeatureItem icon="checkmark-circle-outline" text="Advanced writing analysis" />
            <FeatureItem icon="checkmark-circle-outline" text="Personal learning mentor" />
          </View>

          <TouchableOpacity style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>{t('upgrade_to_master')}</Text>
          </TouchableOpacity>
        </View>

        {/* Promotional Bottom Section */}
        <View style={styles.promoCard}>
           <View style={styles.promoImageContainer}>
                <View style={styles.promoImagePlaceholder}>
                    <Ionicons name="desktop-outline" size={60} color="rgba(255,255,255,0.3)" />
                </View>
           </View>
           <Text style={styles.promoTitle}>Master English with Confidence</Text>
           <Text style={styles.promoDesc}>
             Our curriculum is designed by linguistic experts to take you from foundational basics to fluent academic mastery through immersive, ad-free experiences.
           </Text>
           <View style={styles.promoFeatures}>
                <View style={styles.promoFeatureRow}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={TEXT_PRIMARY} />
                    <Text style={styles.promoFeatureText}>CEFR Certified Curriculum</Text>
                </View>
                <View style={styles.promoFeatureRow}>
                    <Ionicons name="people-outline" size={20} color={TEXT_PRIMARY} />
                    <Text style={styles.promoFeatureText}>Join 2M+ Global Learners</Text>
                </View>
           </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, text, isDisabled }: any) => (
  <View style={styles.featureItem}>
    <Ionicons 
        name={icon} 
        size={18} 
        color={isDisabled ? '#D1D5DB' : TEXT_PRIMARY} 
    />
    <Text style={[styles.featureText, isDisabled && styles.disabledText]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1,
  },
  headerButton: {
    padding: 5,
    width: 40,
    alignItems: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scrollContent: {
    backgroundColor: BACKGROUND_COLOR,
    paddingBottom: 40,
  },
  titleSection: {
    padding: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  planCard: {
    backgroundColor: WHITE,
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  proCard: {
    borderColor: ACCENT_BLUE,
    borderWidth: 1.5,
  },
  bestValueContainer: {
    position: 'relative',
    paddingTop: 10,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: ACCENT_BLUE,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  bestValueText: {
    color: WHITE,
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 1,
  },
  planLevelLabel: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    color: TEXT_SECONDARY,
    letterSpacing: 1,
    marginBottom: 8,
  },
  planName: {
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 25,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Nunito-ExtraBold',
    color: TEXT_PRIMARY,
  },
  pricePeriod: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
  },
  featureList: {
    gap: 12,
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: TEXT_PRIMARY,
  },
  disabledText: {
    color: '#D1D5DB',
  },
  outlineButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: TEXT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
  solidButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: ACCENT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: WHITE,
  },
  promoCard: {
    backgroundColor: WHITE,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  promoImageContainer: {
    marginBottom: 20,
  },
  promoImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: ACCENT_BLUE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  promoDesc: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 20,
  },
  promoFeatures: {
    gap: 10,
  },
  promoFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoFeatureText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: TEXT_PRIMARY,
  },
});
