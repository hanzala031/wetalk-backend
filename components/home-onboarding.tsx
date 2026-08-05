import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, {
  className: 'style',
});

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Welcome to WeVersity!',
    description: 'Build confidence and fluency with the leading AI English tutor.',
  },
  {
    id: '2',
    title: 'Real conversation practice!',
    description: 'Engage in real-life conversations with Olivia, your AI language partner.',
  },
  {
    id: '3',
    title: 'Anytime, Anywhere, Anything',
    description: 'Your AI English tutor is always available to help you master the language.',
  },
];

const LeaderboardItem = ({ rank, name, score, color }: { rank: number; name: string; score: string; color: string }) => (
  <View className="flex-row items-center mb-4 bg-white/10 p-3 rounded-2xl">
    <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: color }}>
      <Text className="text-white font-bold text-xs">{rank}</Text>
    </View>
    <View className="flex-1">
      <View className="h-2 w-24 bg-white/20 rounded-full mb-1" />
      <View className="h-1.5 w-16 bg-white/10 rounded-full" />
    </View>
    <View className="bg-blue-500/20 px-3 py-1 rounded-full">
      <Text className="text-blue-400 text-[10px] font-bold">{score}</Text>
    </View>
  </View>
);

const DarkModal = ({ currentIndex }: { currentIndex: number }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9, translateY: 10 }}
    animate={{ opacity: 1, scale: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 600 }}
    className="w-[85%] bg-[#1a2130] rounded-[40px] p-8 shadow-2xl overflow-hidden"
  >
    <Text className="text-white text-xl font-bold mb-6 text-center">Leaderboard</Text>
    
    <View className="space-y-1">
      <LeaderboardItem rank={1} name="User A" score="1,240 XP" color="#fbbf24" />
      <LeaderboardItem rank={2} name="User B" score="1,120 XP" color="#94a3b8" />
      <LeaderboardItem rank={3} name="User C" score="980 XP" color="#b45309" />
    </View>

    {/* Integrated dynamic text inside the modal for Slide 3 specifically or as a general overlay */}
    {currentIndex === 2 && (
        <MotiView 
            from={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-[#1a2130]/90 items-center justify-center p-6"
        >
            <Text className="text-white text-3xl font-extrabold text-center mb-4">Anytime, Anywhere</Text>
            <Text className="text-gray-400 text-center">Your AI tutor is ready when you are.</Text>
        </MotiView>
    )}
  </MotiView>
);

const PaginationDots = ({ count, activeIndex }: { count: number; activeIndex: number }) => (
  <View className="flex-row justify-center items-center space-x-2">
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          activeIndex === i ? 'w-6 bg-slate-900' : 'w-1.5 bg-slate-300'
        }`}
      />
    ))}
  </View>
);

const BottomNav = () => (
    <View className="absolute bottom-0 left-0 right-0 bg-black/90 h-20 flex-row justify-around items-center px-10 border-t border-white/5">
        <TouchableOpacity className="items-center">
            <FontAwesome name="home" size={24} color="white" />
            <Text className="text-white text-[10px] mt-1 font-medium">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center opacity-50">
            <FontAwesome name="paper-plane" size={20} color="white" />
            <Text className="text-white text-[10px] mt-1 font-medium">Explore</Text>
        </TouchableOpacity>
    </View>
);

export const HomeOnboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  }, []);

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop' }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Soft white gradient overlay from top */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.4)', 'transparent']}
          className="absolute inset-0 h-64"
        />
        
        {/* Main UI Layer - Placed above FlatList for interaction */}
        <View className="flex-1 items-center justify-center pt-20 pb-32" pointerEvents="box-none">
          {/* Main Content Modal */}
          <View pointerEvents="none" className="items-center w-full">
            <DarkModal currentIndex={currentIndex} />
          </View>

          {/* Dynamic Text Section - Bound to FlatList logic */}
          <View className="mt-12 w-full px-8 items-center h-32 justify-center" pointerEvents="none">
            <AnimatePresence>
              <MotiView
                key={currentIndex}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{ type: 'timing', duration: 400 }}
              >
                <Text className="text-3xl font-extrabold text-slate-900 text-center mb-2">
                  {slides[currentIndex].title}
                </Text>
                <Text className="text-lg text-slate-600 text-center px-4 leading-6">
                  {slides[currentIndex].description}
                </Text>
              </MotiView>
            </AnimatePresence>
          </View>

          {/* Action Buttons */}
          <View className="w-full px-8 mt-4" pointerEvents="box-none">
            <TouchableOpacity activeOpacity={0.9} className="mb-6">
              <View className="bg-[#3b82f6] rounded-full py-5 items-center shadow-xl">
                <Text className="text-white text-xl font-bold">Get Started</Text>
              </View>
            </TouchableOpacity>

            <View className="mb-6" pointerEvents="none">
               <PaginationDots count={slides.length} activeIndex={currentIndex} />
            </View>

            <TouchableOpacity>
              <Text className="text-center text-slate-500 font-semibold text-base">
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FlatList for Swipe Logic - Full screen but transparent/empty content */}
        <View className="absolute inset-0" pointerEvents="box-none">
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
            style={{ width, height }}
            />
        </View>

        {/* Static Bottom Navigation */}
        <BottomNav />
      </ImageBackground>
    </View>
  );
};

export default HomeOnboarding;
