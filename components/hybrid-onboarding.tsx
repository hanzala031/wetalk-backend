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
        <MotiView className="w-6 h-2 bg-slate-900 rounded-full" />
        <View className="w-2 h-2 bg-slate-200 rounded-full" />
        <View className="w-2 h-2 bg-slate-200 rounded-full" />
        <View className="w-2 h-2 bg-slate-200 rounded-full" />
    </View>
);

export const HybridOnboarding = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Top Section: Background Video */}
      <View className="absolute top-0 left-0 right-0 h-[60%]">
        <Video
          source={{ uri: 'https://res.cloudinary.com/do0kkpv1f/video/upload/q_auto/f_auto/v1776495416/4201543-hd_1920_1080_30fps_y7eoga.mp4' }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
        {/* Subtle transition gradient */}
        <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.3)', '#ffffff']}
            className="absolute bottom-0 left-0 right-0 h-40"
        />
      </View>

      {/* Bottom Section: Solid Content Area */}
      <View 
        className="flex-1 mt-[55%] bg-white rounded-t-[40px] px-8 pt-12 shadow-2xl"
        style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 25,
        }}
      >
        <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800 }}
            className="items-center"
        >
            <Text 
                className="text-[32px] font-extrabold text-slate-900 text-center mb-4 tracking-tight"
                style={{ fontFamily: 'Poppins' }}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                Welcome to WeVersity!
            </Text>
            <Text 
                className="text-lg text-gray-500 text-center px-6 leading-6 mb-12"
                style={{ fontFamily: 'Poppins' }}
            >
                Build confidence and fluency with the leading AI English tutor.
            </Text>

            <View className="w-full">
                <PaginationDots />

                <TouchableOpacity activeOpacity={0.8}>
                    <MotiView
                        className="bg-[#2563eb] rounded-full py-5 items-center mb-8 shadow-xl shadow-blue-500/30"
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
            </View>
        </MotiView>
      </View>
    </View>
  );
};

export default HybridOnboarding;
