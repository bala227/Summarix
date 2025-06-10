import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { withSpring } from 'react-native-reanimated'; 

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const circlePosition = useSharedValue(isDark ? 20 : 0);

useEffect(() => {
  circlePosition.value = withSpring(isDark ? 20 : 0, {
    stiffness: 150,     // controls the spring tension
    damping: 12,        // optional: controls the bounce (lower = more bounce)
    mass: 1,            // optional: higher = more inertia
  });
}, [isDark]);

  const onPressToggle = () => {
    toggleTheme(); // isDark will update, triggering useEffect
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: circlePosition.value }],
  }));

  return (
    <Pressable
      onPress={onPressToggle}
      className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full px-1 justify-center"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Animated.View
        className="w-6 h-6 rounded-full bg-white items-center justify-center"
        style={circleStyle}
      >
        {isDark ? (
          <Ionicons name="moon" size={14} color="black" />
        ) : (
          <Ionicons name="sunny" size={14} color="orange" />
        )}
      </Animated.View>
    </Pressable>
  );
}
