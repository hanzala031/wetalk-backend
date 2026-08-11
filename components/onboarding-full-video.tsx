import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, {
  className: 'style',
});

const { width, height } = Dimensions.get('window');

const videoSource = 'https://res.cloudinary.com/do0kkpv1f/video/upload/q_auto/f_auto/v1776495416/4201543-hd_1920_1080_30fps_y7eoga.mp4';

const PaginationDots = () => (
    <View className="flex-row items-center justify-center space-x-4 mb-8">
        <View className="w-6 h-2 bg-slate-900 rounded-full" />
        <View className="w-2 h-2 bg-slate-200 rounded-full" />
        <View className="w-2 h-2 bg-slate-200 rounded-full" />
        <View className="w-2 h-2 bg-slate-200 rounded-full" />
    </View>
);

export const OnboardingFullVideo = () => {
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View className="flex-1 bg-white">
      {/* 1. Background Structure: Full-Screen Absolute Video */}
      <View style={StyleSheet.absoluteFill}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
        {/* Subtle White Overlay for legibility */}
        <View className="absolute inset-0 bg-white/20" />
        
        {/* Gradient transition to the solid white bottom area */}
        <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.8)', '#ffffff']}
            className="absolute bottom-[35%] left-0 right-0 h-32"
        />
      </View>

      {/* 2. Content & Layout: Strict Bottom-Alignment */}
      <View className="flex-1 justify-end">
        {/* Top Section: Empty (Video visible here) */}
        <View className="flex-1" />

        {/* 3. Content Container: Bottom solid white area (approx 40%) */}
        <MotiView 
          from={{ translateY: height * 0.4 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 1000 }}
          className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 shadow-2xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -15 },
            shadowOpacity: 0.15,
            shadowRadius: 30,
            elevation: 20,
          }}
        >
          {/* Typography & Elements */}
          <View className="items-center mb-8">
            <Text 
                className="text-[24px] font-extrabold text-slate-900 text-center mb-3 tracking-tight"
                style={{ fontFamily: 'Poppins' }}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                Welcome to WeVersity!
            </Text>
            <Text 
                className="text-lg text-gray-500 text-center px-4 leading-6 font-medium"
                style={{ fontFamily: 'Poppins' }}
            >
                Build confidence and fluency with the leading AI English tutor.
            </Text>
          </View>

          <PaginationDots />

          {/* 4. Buttons */}
          <TouchableOpacity activeOpacity={0.8} className="mb-8">
            <MotiView
                className="bg-[#2563eb] rounded-full py-5 items-center shadow-xl shadow-blue-500/30"
            >
                <Text className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins' }}>
                    Get Started
                </Text>
            </MotiView>
          </TouchableOpacity>

          <TouchableOpacity className="pb-4">
            <Text className="text-center text-slate-900 font-bold text-lg" style={{ fontFamily: 'Poppins' }}>
                I already have an account
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </View>
  );
};

export default OnboardingFullVideo;
