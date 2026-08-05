import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';

cssInterop(LinearGradient, {
  className: 'style',
});
cssInterop(BlurView, {
  className: 'style',
});

const { width } = Dimensions.get('window');

const ReviewBar = ({ stars, progress }: { stars: string; progress: number }) => (
  <View className="flex-row items-center mb-1.5">
    <Text className="text-gray-400 text-[10px] w-12 font-medium">{stars}</Text>
    <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <MotiView
        from={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'timing', duration: 1000, delay: 500 }}
        className="h-full bg-[#facc15] rounded-full"
      />
    </View>
  </View>
);

const BottomNav = () => (
    <View className="absolute bottom-0 left-0 right-0 bg-black h-20 flex-row justify-around items-center px-10 border-t border-white/5">
        <TouchableOpacity className="items-center">
            <FontAwesome name="home" size={24} color="white" />
            <Text className="text-white text-[10px] mt-1 font-bold">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center opacity-50">
            <MaterialCommunityIcons name="send" size={22} color="white" style={{ transform: [{ rotate: '-45deg' }] }} />
            <Text className="text-white text-[10px] mt-1 font-bold">Explore</Text>
        </TouchableOpacity>
    </View>
);

export const WeVersityWelcome = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Background Gradient with subtle frosted effect */}
      <LinearGradient
        colors={['#f0f9ff', '#ffffff', '#f0f9ff']}
        className="absolute inset-0"
      />
      <View className="absolute inset-0 opacity-20">
         <BlurView intensity={20} className="flex-1" />
      </View>

      <View className="flex-1 items-center px-8 pt-20">
        {/* Top Card Section: Fade in from top */}
        <MotiView
          from={{ opacity: 0, translateY: -60 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          className="w-full bg-white rounded-[40px] p-8 shadow-2xl mb-14"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 15 },
            shadowOpacity: 0.08,
            shadowRadius: 30,
            elevation: 10,
          }}
        >
          <Text className="text-center text-xl font-bold mb-5 text-gray-900">
            Over 250k App Reviews
          </Text>

          <View className="flex-row items-center justify-center mb-8">
            <View className="flex-row mr-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <FontAwesome key={i} name="star" size={28} color="#facc15" className="mx-0.5" />
              ))}
            </View>
            <Text className="text-2xl font-bold text-gray-800">4.9</Text>
          </View>

          <View className="px-2 mb-6">
            <ReviewBar stars="5 stars" progress={90} />
            <ReviewBar stars="4 stars" progress={15} />
            <ReviewBar stars="3 stars" progress={5} />
            <ReviewBar stars="2 stars" progress={2} />
            <ReviewBar stars="1 star" progress={2} />
          </View>

          <View className="flex-row justify-center items-center space-x-6 opacity-30">
            <View className="flex-row items-center">
               <FontAwesome name="google" size={18} color="gray" />
               <Text className="ml-1 text-[10px] font-bold">G2</Text>
            </View>
            <FontAwesome name="apple" size={22} color="gray" />
            <FontAwesome name="play" size={18} color="gray" />
          </View>
        </MotiView>

        {/* Text Section: Slide up from bottom */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 200 }}
          className="items-center"
        >
          <Text className="text-[34px] font-extrabold text-gray-900 text-center mb-3">
            Welcome to WeVersity!
          </Text>
          <Text className="text-lg text-gray-400 text-center px-6 leading-6 mb-10">
            Build confidence and fluency with the leading AI English tutor.
          </Text>

          {/* Carousel Dots */}
          <View className="flex-row space-x-2 mb-14">
            <View className="w-2.5 h-2.5 bg-[#1e293b] rounded-full" />
            <View className="w-2 h-2 bg-gray-200 rounded-full" />
            <View className="w-2 h-2 bg-gray-200 rounded-full" />
            <View className="w-2 h-2 bg-gray-200 rounded-full" />
          </View>
        </MotiView>

        {/* Footer Actions */}
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 500 }}
            className="w-full px-2"
        >
            <TouchableOpacity activeOpacity={0.8}>
                <MotiView
                    from={{ scale: 1 }}
                    className="bg-[#2563eb] rounded-full py-5 items-center mb-8 shadow-lg shadow-blue-500/30"
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

      <BottomNav />
    </View>
  );
};

export default WeVersityWelcome;
