import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

import { router } from 'expo-router';
import { ThemedText } from './themed-text';

const { width, height } = Dimensions.get('window');

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
  {
    id: '4',
    title: 'Personalized learning',
    description: 'Get instant feedback on your English as you progress.',
  },
];

const PaginationDots = ({ activeIndex }: { activeIndex: number }) => (
  <View style={styles.dotsContainer}>
    {slides.map((_, i) => (
      <MotiView
        key={i}
        animate={{
          width: activeIndex === i ? 24 : 8,
          backgroundColor: activeIndex === i ? '#000' : '#D3D3D3',
        }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.dot}
      />
    ))}
  </View>
);

export const FinalWeTalkOnboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const player = useVideoPlayer('https://res.cloudinary.com/do0kkpv1f/video/upload/q_auto/f_auto/v1776495416/4201543-hd_1920_1080_30fps_y7eoga.mp4', (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  }, []);

  return (
    <View style={styles.container}>
      {/* TOP 60% HEIGHT: VIDEO BACKGROUND */}
      <View style={{ height: height * 0.6, width: '100%', overflow: 'hidden' }}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        {/* MIDDLE SECTION GRADIENT (Using #E1F2E1 from image) */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(225, 242, 225, 0.4)', '#DFEBEB']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>
      <View style={{ flex: 1, backgroundColor: '#DFEBEB', justifyContent: 'center' }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.sliderWrapper}>
            <FlatList
              ref={flatListRef}
              data={slides}
              renderItem={({ item }) => (
                <View style={styles.slide}>
                  <ThemedText 
                    type="title"
                    style={styles.title} 
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.subtitle}>{item.description}</ThemedText>
                </View>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          </View>
          <View style={styles.footer}>
            <PaginationDots activeIndex={currentIndex} />
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.buttonContainer}
              onPress={() => router.push('/onboarding-intro')}
            >
              <MotiView
                style={styles.button}
              >
                <ThemedText type="button" style={styles.buttonText}>Get Started</ThemedText>
              </MotiView>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryLink}
              onPress={() => router.push('/sign-in')}
            >
              <ThemedText type="button" style={styles.secondaryText}>I already have an account</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFEBEB',
  },
  sliderWrapper: {
    height: 140,
    justifyContent: 'center',
  },
  slide: {
    width: width,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 15,
    letterSpacing: -0.3,
  },
  footer: {
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  buttonContainer: {
    marginHorizontal: 10,
    shadowColor: '#005680',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    backgroundColor: '#005680',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#FFF',
    fontSize: 18,
  },
  secondaryLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  secondaryText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#005680',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FinalWeTalkOnboarding;
