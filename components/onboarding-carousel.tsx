import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MotiView, AnimatePresence } from 'moti';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

const videoSource = 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-studying-with-headphones-43841-large.mp4';

cssInterop(LinearGradient, {
  className: 'style',
});
cssInterop(BlurView, {
  className: 'style',
});

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  backgroundType: 'reviewCard' | 'phoneScreen';
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Welcome to WeVersity!',
    description: 'Build confidence and fluency with the leading AI English tutor.',
    backgroundType: 'reviewCard',
  },
  {
    id: '2',
    title: 'Real conversation practice!',
    description: 'Engage in real-life conversations with Olivia, your AI language partner.',
    backgroundType: 'phoneScreen',
  },
  {
    id: '3',
    title: 'Anytime, Anywhere, Anything',
    description: 'Your AI English tutor is always available to help you master the language.',
    backgroundType: 'phoneScreen',
  },
];

const ReviewBar = ({ stars, progress }: { stars: string; progress: number }) => (
  <View className="flex-row items-center mb-1">
    <Text className="text-gray-500 text-[10px] w-10">{stars}</Text>
    <View className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
      <MotiView
        from={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'timing', duration: 1000, delay: 500 }}
        className="h-full bg-yellow-400 rounded-full"
      />
    </View>
  </View>
);

const ReviewCard = () => (
  <MotiView
    from={{ opacity: 0, scale: 0.9, translateY: 20 }}
    animate={{ 
        opacity: 1, 
        scale: 1, 
        translateY: [0, -10, 0],
    }}
    exit={{ opacity: 0, scale: 0.9, translateY: -20 }}
    transition={{ 
        type: 'spring', 
        damping: 15,
        translateY: {
            type: 'timing',
            duration: 2000,
            loop: true,
        }
    }}
    className="w-72 rounded-3xl overflow-hidden shadow-2xl items-center"
  >
    <BlurView intensity={80} tint="light" className="w-full p-6 items-center">
        <Text className="text-xl font-bold mb-4 text-gray-900">Over 250k App Reviews</Text>
        <View className="flex-row items-center mb-6">
        <View className="flex-row mr-2">
            {[1, 2, 3, 4, 5].map((i) => (
            <FontAwesome key={i} name="star" size={20} color="#facc15" className="mx-0.5" />
            ))}
        </View>
        <Text className="text-xl font-bold text-gray-800">4.9</Text>
        </View>
        <View className="w-full px-2">
        <ReviewBar stars="5 stars" progress={90} />
        <ReviewBar stars="4 stars" progress={15} />
        <ReviewBar stars="3 stars" progress={5} />
        <ReviewBar stars="2 stars" progress={2} />
        <ReviewBar stars="1 star" progress={2} />
        </View>
        <View className="flex-row justify-center items-center mt-6 space-x-6">
        <FontAwesome name="google" size={16} color="#666" className="opacity-50" />
        <FontAwesome name="apple" size={20} color="#666" className="opacity-50" />
        <FontAwesome name="play" size={16} color="#666" className="opacity-50" />
        </View>
    </BlurView>
  </MotiView>
);

const PhoneMockup = ({ type }: { type: number }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.8, rotateY: '30deg' }}
    animate={{ opacity: 1, scale: 1, rotateY: '0deg' }}
    exit={{ opacity: 0, scale: 0.8, rotateY: '-30deg' }}
    transition={{ type: 'spring', damping: 12 }}
    className="w-64 h-[400px] bg-slate-900 rounded-[40px] border-[6px] border-slate-800 overflow-hidden shadow-2xl"
  >
    <LinearGradient colors={['#00608A', '#004D73']} className="flex-1 p-4">
      {type === 1 ? (
        <View className="items-center mt-8">
          <View className="w-24 h-24 rounded-full bg-blue-500 mb-4 items-center justify-center">
             <FontAwesome name="user" size={48} color="white" />
          </View>
          <Text className="text-white text-xl font-bold mb-1">Olivia</Text>
          <Text className="text-blue-400 text-sm mb-6">AI Partner</Text>
          <View className="w-full space-y-3">
             <View className="h-3 w-3/4 bg-slate-700 rounded-full" />
             <View className="h-3 w-1/2 bg-slate-700 rounded-full" />
             <View className="h-3 w-2/3 bg-slate-700 rounded-full" />
          </View>
        </View>
      ) : (
        <View className="mt-4">
          <Text className="text-white text-lg font-bold mb-4">Leaderboard</Text>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="flex-row items-center mb-4 bg-slate-800/50 p-3 rounded-2xl">
              <View className="w-8 h-8 rounded-full bg-slate-700 mr-3 items-center justify-center">
                <Text className="text-white font-bold">{i}</Text>
              </View>
              <View className="flex-1">
                 <View className="h-2 w-20 bg-slate-600 rounded-full mb-1" />
                 <View className="h-2 w-12 bg-slate-500 rounded-full" />
              </View>
              <View className="w-10 h-4 bg-blue-500/20 rounded-full" />
            </View>
          ))}
        </View>
      )}
    </LinearGradient>
  </MotiView>
);

const PaginationDots = ({ count, activeIndex }: { count: number; activeIndex: number }) => {
  return (
    <View className="flex-row justify-center items-center space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <MotiView
          key={i}
          animate={{
            width: activeIndex === i ? 24 : 8,
            opacity: activeIndex === i ? 1 : 0.3,
            backgroundColor: activeIndex === i ? '#2563eb' : '#94a3b8',
          }}
          transition={{ type: 'timing', duration: 300 }}
          className="h-2 rounded-full"
        />
      ))}
    </View>
  );
};

export const OnboardingCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <View className="absolute inset-0">
        <VideoView
          player={player}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          nativeControls={false}
        />
        <LinearGradient
          colors={['rgba(224, 242, 254, 0.4)', 'rgba(255, 255, 255, 0.95)']}
          className="absolute inset-0"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.8 }}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={() => <View style={{ width, height }} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="absolute inset-0"
      />

      <View className="absolute inset-0 pt-20 pb-16 px-8" pointerEvents="box-none">
        <View className="flex-1 justify-center items-center" pointerEvents="none">
          <AnimatePresence>
            {currentIndex === 0 && <ReviewCard key="review" />}
            {currentIndex === 1 && <PhoneMockup key="phone1" type={1} />}
            {currentIndex === 2 && <PhoneMockup key="phone2" type={2} />}
          </AnimatePresence>
        </View>

        <View pointerEvents="box-none">
          <View className="h-40 justify-center" pointerEvents="none">
              <AnimatePresence>
                  <MotiView
                      key={`title-${currentIndex}`}
                      from={{ opacity: 0, translateY: 10 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -10 }}
                      transition={{ type: 'timing', duration: 400 }}
                  >
                      <Text className="text-3xl font-extrabold text-slate-900 text-center mb-3">
                          {slides[currentIndex].title}
                      </Text>
                      <Text className="text-lg text-slate-600 text-center px-4">
                          {slides[currentIndex].description}
                      </Text>
                  </MotiView>
              </AnimatePresence>
          </View>

          <View className="mb-8" pointerEvents="none">
              <PaginationDots count={slides.length} activeIndex={currentIndex} />
          </View>

          <TouchableOpacity 
            activeOpacity={0.8} 
            className="mb-6"
            onPress={() => router.push('/onboarding-intro')}
          >
            <MotiView
              className="bg-blue-600 rounded-full py-5 items-center shadow-lg"
            >
              <Text className="text-white text-xl font-bold">Get Started</Text>
            </MotiView>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text className="text-center text-slate-900 font-semibold text-lg">
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OnboardingCarousel;
