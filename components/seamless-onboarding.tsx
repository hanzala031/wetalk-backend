import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, {
  className: 'style',
});

const { width, height } = Dimensions.get('window');

const PaginationDots = () => (
    <View className="flex-row items-center justify-center space-x-4 mb-10">
        <View className="w-6 h-2 bg-slate-900 rounded-full" />
        <View className="w-2 h-2 bg-slate-900/20 rounded-full" />
        <View className="w-2 h-2 bg-slate-900/20 rounded-full" />
        <View className="w-2 h-2 bg-slate-900/20 rounded-full" />
    </View>
);

export const SeamlessOnboarding = () => {
  return (
    <View className="flex-1 bg-white">
      {/* 1. Background Structure: Full-Screen Absolute Video */}
      <View style={StyleSheet.absoluteFill}>
        <Video
          source={{ uri: 'https://res.cloudinary.com/do0kkpv1f/video/upload/q_auto/f_auto/v1776495416/4201543-hd_1920_1080_30fps_y7eoga.mp4' }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
        
        {/* Seamless Transition Overlay: Translucent Gradient (No solid box) */}
        <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.8)']}
            className="absolute inset-0"
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* 2. Content & Layout: Fixed Bottom-Third (Floating) */}
      <View className="flex-1 justify-end px-8 pb-20">
        {/* Top Section: Empty (Dedicated to seamless video background) */}
        <View className="flex-1" />

        <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            className="w-full"
        >
            {/* Branding: Floating Text Block */}
            <View className="items-center mb-12">
                <Text 
                    className="text-[36px] font-extrabold text-slate-900 text-center mb-4 tracking-tight"
                    style={{ fontFamily: 'Poppins' }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    Welcome to WeVersity!
                </Text>
                <Text 
                    className="text-lg text-slate-700 text-center px-4 leading-6 font-medium"
                    style={{ fontFamily: 'Poppins' }}
                >
                    Build confidence and fluency with the leading AI English tutor.
                </Text>
            </View>

            {/* 3. Interactive Elements: Floating pagination and buttons */}
            <PaginationDots />

            <TouchableOpacity activeOpacity={0.8} className="mb-8">
                <MotiView
                    className="bg-[#2563eb] rounded-full py-5 items-center shadow-2xl shadow-blue-600/50"
                    style={{
                        elevation: 15,
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.4,
                        shadowRadius: 20,
                    }}
                >
                    <Text className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins' }}>
                        Get Started
                    </Text>
                </MotiView>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text className="text-center text-slate-900 font-bold text-lg" style={{ fontFamily: 'Poppins' }}>
                    I already have an account
                </Text>
            </TouchableOpacity>
        </MotiView>
      </View>
    </View>
  );
};

export default SeamlessOnboarding;
