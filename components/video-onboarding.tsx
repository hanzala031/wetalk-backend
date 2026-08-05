import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';

const { width } = Dimensions.get('window');

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

export const VideoOnboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  }, []);

  return (
    <View style={styles.container}>
      {/* SIMPLE WHITE GRADIENT BACKGROUND */}
      <LinearGradient
        colors={['#ffffff', '#f0f9ff', '#e0f2fe']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* TOP SPACER */}
          <View style={{ flex: 1 }} />

          {/* SLIDER CONTENT */}
          <View style={styles.sliderWrapper}>
            <FlatList
              ref={flatListRef}
              data={slides}
              renderItem={({ item }) => (
                <View style={styles.slide}>
                  <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                    {item.title}
                  </Text>
                  <Text style={styles.subtitle}>{item.description}</Text>
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

          {/* FOOTER SECTION */}
          <View style={styles.footer}>
            <PaginationDots activeIndex={currentIndex} />

            <TouchableOpacity activeOpacity={0.8} style={styles.buttonContainer}>
              <MotiView
                style={styles.button}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </MotiView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryLink}>
              <Text style={styles.secondaryText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  sliderWrapper: {
    height: 200,
  },
  slide: {
    width: width,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    letterSpacing: -0.3,
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  buttonContainer: {
    marginHorizontal: 20,
    shadowColor: '#2F6BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    backgroundColor: '#2F6BFF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default VideoOnboarding;
