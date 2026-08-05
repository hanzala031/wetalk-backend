import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, {
  className: 'style',
});

const { width } = Dimensions.get('window');

const PaginationDots = () => (
    <View className="flex-row items-center justify-center space-x-4 mb-16">
        <View className="w-6 h-2 bg-[#1e293b] rounded-full" />
        <View className="w-2 h-2 bg-gray-200 rounded-full" />
        <View className="w-2 h-2 bg-gray-200 rounded-full" />
        <View className="w-2 h-2 bg-gray-200 rounded-full" />
    </View>
);

export const WeVersityMinimal = () => {
  return (
    <View className="flex-1">
      {/* Background Gradient: White to Light Cyan */}
      <LinearGradient
        colors={['#ffffff', '#f0f9ff']}
        className="absolute inset-0"
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View className="flex-1 justify-end px-8 pb-32">
        {/* Top Section (Empty negative space - first third of screen) */}
        <View className="flex-1" />

        {/* Middle Section: App Description */}
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            className="items-center mb-16"
        >
            <Text 
                className="text-[32px] font-extrabold text-gray-900 text-center mb-4 tracking-tight"
                style={{ fontFamily: 'Poppins' }}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                Welcome to WeVersity!
            </Text>
            <Text 
                className="text-lg text-gray-500 text-center px-6 leading-6"
                style={{ fontFamily: 'Poppins' }}
            >
                Build confidence and fluency with the leading AI English tutor.
            </Text>
        </MotiView>

        {/* Bottom Section: Pagination and Actions */}
        <View className="w-full">
            <PaginationDots />

            <TouchableOpacity activeOpacity={0.8}>
                <MotiView
                    from={{ scale: 1 }}
                    className="bg-[#2563eb] rounded-full py-5 items-center mb-8 shadow-lg shadow-blue-500/20"
                >
                    <Text className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins' }}>
                        Get Started
                    </Text>
                </MotiView>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text className="text-center text-gray-900 font-bold text-lg" style={{ fontFamily: 'Poppins' }}>
                    I already have an account
                </Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default WeVersityMinimal;
