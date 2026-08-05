import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { FontAwesome } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, {
  className: 'style',
});

const { width } = Dimensions.get('window');

const ReviewBar = ({ stars, progress }: { stars: string; progress: number }) => (
  <View className="flex-row items-center mb-1">
    <Text className="text-gray-500 text-xs w-12">{stars}</Text>
    <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <View
        style={{ width: `${progress}%` }}
        className="h-full bg-yellow-400 rounded-full"
      />
    </View>
  </View>
);

export const LooraWelcome = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Background Gradient */}
      <LinearGradient
        colors={['#e0f2fe', '#ffffff', '#ffffff', '#e0f2fe']}
        className="absolute inset-0"
        style={{ opacity: 0.6 }}
      />

      <View className="flex-1 justify-center items-center px-8 pt-12">
        {/* Top Card Section */}
        <MotiView
          from={{ opacity: 0, translateY: -50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000 }}
          className="w-full bg-white rounded-3xl p-6 shadow-xl mb-12"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Text className="text-center text-xl font-bold mb-4">
            Over 250k App Reviews
          </Text>

          <View className="flex-row items-center justify-center mb-6">
            <View className="flex-row mr-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <FontAwesome key={i} name="star" size={24} color="#facc15" className="mx-0.5" />
              ))}
            </View>
            <Text className="text-2xl font-bold text-gray-800">4.9</Text>
          </View>

          <View className="px-2">
            <ReviewBar stars="5 stars" progress={90} />
            <ReviewBar stars="4 stars" progress={15} />
            <ReviewBar stars="3 stars" progress={5} />
            <ReviewBar stars="2 stars" progress={2} />
            <ReviewBar stars="1 star" progress={2} />
          </View>

          <View className="flex-row justify-center items-center mt-6 space-x-4">
            {/* G2 Logo Placeholder */}
            <View className="opacity-40 grayscale flex-row items-center">
              <FontAwesome name="google" size={16} color="gray" />
              <Text className="ml-1 text-[10px] font-bold text-gray-500">G2</Text>
            </View>
            {/* Apple Logo Placeholder */}
            <FontAwesome name="apple" size={20} color="gray" className="opacity-40" />
            {/* Play Store Logo Placeholder */}
            <FontAwesome name="play" size={16} color="gray" className="opacity-40" />
          </View>
        </MotiView>

        {/* Text Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000, delay: 300 }}
          className="items-center"
        >
          <Text className="text-3xl font-extrabold text-gray-900 text-center mb-2">
            Welcome to Loora!
          </Text>
          <Text className="text-lg text-gray-500 text-center px-4 mb-8">
            Build confidence and fluency with the leading AI English tutor.
          </Text>

          {/* Carousel Dots */}
          <View className="flex-row mb-12">
            <View className="w-2.5 h-2.5 bg-gray-900 rounded-full mx-1" />
            <View className="w-2 h-2 bg-gray-300 rounded-full mx-1" />
            <View className="w-2 h-2 bg-gray-300 rounded-full mx-1" />
            <View className="w-2 h-2 bg-gray-300 rounded-full mx-1" />
          </View>
        </MotiView>
      </View>

      {/* Footer Buttons */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 600 }}
        className="px-8 pb-12"
      >
        <TouchableOpacity activeOpacity={0.8}>
          <MotiView
            from={{ scale: 1 }}
            className="bg-blue-600 rounded-full py-5 items-center mb-6"
            style={{
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text className="text-white text-xl font-bold">Get Started</Text>
          </MotiView>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text className="text-center text-gray-900 font-bold text-lg">
            I already have an account
          </Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
};

export default LooraWelcome;
