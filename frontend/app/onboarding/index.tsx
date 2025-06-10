// app/index.tsx
import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import '../../global.css'; // Ensure this sets up NativeWind

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white justify-between p-6 pt-20">
      {/* Top Illustration */}
      <View className="items-center mt-16">
        <Text className="text-3xl font-pbold text-gray-800 mb-6">Summarix 🌍</Text>
        <Image
          source={require('../../assets/images/news-illustration.jpg')} // <-- Add this image to your assets
          className="w-80 h-80"
          resizeMode="contain"
        />
      </View>

      {/* Text Content */}
      <View>
        <Text className="text-2xl font-psemibold text-center text-black mb-7">
          News at your fingertips
        </Text>
        <Text className="text-base font-pregular text-center text-gray-600 mt-2">
          Unlock the future of news – AI-driven summaries, tailored to your interests
        </Text>
      </View>

      {/* Bottom Content */}
      <View>
        <TouchableOpacity
          className="bg-blue-800 rounded-lg py-4"
           onPress={() => router.push("/login")}
        >
          <Text className="text-white text-center text-lg font-pmedium">Get Started</Text>
        </TouchableOpacity>

        {/* Privacy Text */}
        <Text className="text-xs text-center text-gray-500 mt-4 font-pregular">
          By continuing, you agree to{' '}
          <Text className="text-blue-600">Summarix Privacy Practices</Text>
        </Text>

        {/* Progress Bar (1/3 dots indicator) */}
        <View className="flex-row justify-center mt-4 space-x-1">
          <View className="w-12 h-1 rounded-full bg-gray-800" />
          <View className="w-4 h-1 rounded-full bg-gray-300" />
          <View className="w-4 h-1 rounded-full bg-gray-300" />
        </View>
      </View>
    </View>
  );
}
