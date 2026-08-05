import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, {
  className: 'style',
});

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Real conversation practice!',
    description: 'Engage in real-life conversations as you build your speaking skills.',
    image: 'https://i.postimg.cc/mD8T0r4W/image-ad2d0b.jpg',
  },
  {
    id: '2',
    title: 'Anytime, Anywhere, Anything',
    description: 'Your AI English tutor is always available for a chat.',
    image: 'https://i.postimg.cc/zX8r5S4h/image-ad2d2b.jpg',
  },
  {
    id: '3',
    title: 'Personalized learning',
    description: 'Get instant feedback on your English as you progress.',
    image: 'https://i.postimg.cc/766D5x6w/image-ad2d6d.jpg',
  },
];

const IPhoneMockup = ({ imageUri }: { imageUri: string }) => (
  <View className="w-[280px] h-[580px] bg-black rounded-[50px] border-[8px] border-slate-800 shadow-2xl overflow-hidden self-center">
    {/* Dynamic Island */}
    <View className="absolute top-4 left-1/2 -ml-10 w-20 h-6 bg-black rounded-full z-10" />
    
    <Image
      source={{ uri: imageUri }}
      contentFit="cover"
      style={StyleSheet.absoluteFill}
      transition={500}
    />
  </View>
);

const PaginationDots = ({ count, activeIndex }: { count: number; activeIndex: number }) => (
  <View className="flex-row items-center justify-center space-x-3 mb-10">
    {Array.from({ length: count }).map((_, i) => (
      <MotiView
        key={i}
        animate={{
          width: activeIndex === i ? 24 : 8,
          backgroundColor: activeIndex === i ? '#00FFFF' : '#ffffff40',
        }}
        className="h-2 rounded-full"
      />
    ))}
  </View>
);

export const WeTalkOnboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  }, []);

  return (
    <View className="flex-1 bg-[#000033]">
      <LinearGradient
        colors={['#000055', '#000033', '#000022']}
        className="absolute inset-0"
      />

      {/* Main Content Slider */}
      <View className="flex-1 pt-12">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => (
            <View style={{ width }} className="items-center justify-center px-8">
                <IPhoneMockup imageUri={item.image} />
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

      {/* Text and Actions Overlay */}
      <View className="px-8 pb-12 pt-6">
        <View className="h-32 justify-center mb-6">
            <AnimatePresence>
                <MotiView
                    key={currentIndex}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -20 }}
                    transition={{ type: 'timing', duration: 400 }}
                    className="items-center"
                >
                    <Text className="text-3xl font-extrabold text-white text-center mb-3">
                        {slides[currentIndex].title}
                    </Text>
                    <Text className="text-base text-slate-300 text-center px-4 leading-6">
                        {slides[currentIndex].description}
                    </Text>
                </MotiView>
            </AnimatePresence>
        </View>

        <PaginationDots count={slides.length} activeIndex={currentIndex} />

        <TouchableOpacity activeOpacity={0.8} className="mb-6">
          <MotiView
            className="bg-[#00FFFF] rounded-full py-5 items-center shadow-lg shadow-cyan-500/40"
          >
            <Text className="text-[#000033] text-xl font-bold">Get Started</Text>
          </MotiView>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text className="text-center text-slate-400 font-semibold text-base">
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipe Indicator (Visible on first slide) */}
      {currentIndex === 0 && (
        <MotiView
            from={{ opacity: 0, translateX: 10 }}
            animate={{ opacity: 1, translateX: [0, 10, 0] }}
            transition={{ loop: true, type: 'timing', duration: 2000 }}
            className="absolute right-4 top-1/2 items-center"
        >
            <Text className="text-[#00FFFF] text-xs font-bold rotate-90 mb-4">SWIPE</Text>
        </MotiView>
      )}
    </View>
  );
};

export default WeTalkOnboarding;
