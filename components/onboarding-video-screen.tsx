import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, StatusBar } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const COLORS = {
    HEADING: '#1A1A1A',
    SUBTEXT: '#4B5563',
    PRIMARY_BLUE: '#004D73',
    DOT_INACTIVE: 'rgba(0, 77, 115, 0.2)',
    BG_LIGHT: '#F7F9FC',
};

interface Slide {
  id: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Welcome to WeTalk!',
    description: 'Build confidence and fluency with the leading AI English tutor.',
  },
  {
    id: '2',
    title: 'Real conversation practice!',
    description: 'Engage in real-life conversations as you build your speaking skills.',
  },
  {
    id: '3',
    title: 'Anytime, Anywhere, Anything',
    description: 'Your AI English tutor is always available for a chat.',
  },
];

export const OnboardingVideoScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== currentIndex) {
        setCurrentIndex(index);
    }
  }, [currentIndex]);

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
        <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
                {item.title}
            </Text>
            <Text style={styles.subtitle}>{item.description}</Text>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Background Video */}
      <View style={styles.videoWrapper}>
        <Video
          source={{ uri: 'https://res.cloudinary.com/do0kkpv1f/video/upload/q_auto/f_auto/v1776495416/4201543-hd_1920_1080_30fps_y7eoga.mp4' }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          useNativeControls={false}
        />
        
        <LinearGradient
          colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.4)', 'rgba(240, 249, 255, 0.95)', COLORS.BG_LIGHT]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.85 }}
        />
      </View>

      {/* Swiper Content */}
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
      />

      {/* Static Footer Overlay */}
      <View style={styles.footerOverlay} pointerEvents="box-none">
        <View style={styles.footerContent}>
            {/* Pagination Dots */}
            <View style={styles.dotsContainer}>
                {slides.map((_, i) => (
                    <MotiView 
                        key={i} 
                        animate={{ 
                            width: currentIndex === i ? 28 : 10,
                            backgroundColor: currentIndex === i ? COLORS.PRIMARY_BLUE : COLORS.DOT_INACTIVE 
                        }}
                        transition={{ type: 'timing', duration: 200 }}
                        style={styles.dot} 
                    />
                ))}
            </View>

            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => router.push('/onboarding-intro')}
              style={styles.buttonWrapper}
            >
                <View style={styles.primaryButton}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/sign-in')}
              style={styles.loginLink}
            >
                <Text style={styles.loginText}>I already have an account</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_LIGHT,
  },
  videoWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  slide: {
    width: width,
    height: height,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 230, // Space for the static footer
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 21,
    fontFamily: 'Nunito-ExtraBold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    width: '100%',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: COLORS.SUBTEXT,
    textAlign: 'center',
    lineHeight: 24,
  },
  footerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  footerContent: {
    width: '100%',
    paddingHorizontal: 30,
    paddingBottom: 50,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
  },
  loginLink: {
    paddingVertical: 10,
  },
  loginText: {
    color: COLORS.PRIMARY_BLUE,
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
  },
});

export default OnboardingVideoScreen;
