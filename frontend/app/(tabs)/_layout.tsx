import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { isDark } = useTheme();

  const renderIcon = (name: string, color: string, focused: boolean) => {
  const iconColor = name === 'star' && focused ? 'orange' : color;

  return (
    <>
      <FontAwesome5 name={name} size={22} color={iconColor} solid />
      {focused && (
        <View
          style={{
            position: 'absolute',
            bottom: -4,
            alignSelf: 'center',
            width: 5,
            height: 5,
            borderRadius: 4,
            backgroundColor: 'red',
          }}
        />
      )}
    </>
  );
};


  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          paddingTop: 5,
          left: 20,
          right: 20,
          height: 50,
          borderRadius: 30,
          overflow: 'hidden',
          borderTopWidth: 0,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: isDark ? '#fff' : '#111',
        tabBarInactiveTintColor: isDark ? '#888' : '#aaa',
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 100}
            tint={isDark ? 'dark' : 'light'}
            style={{
              flex: 1,
              borderRadius: 30,
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.4)',
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => renderIcon('home', color, focused),
        }}
      />
      <Tabs.Screen
        name="Favourite"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => renderIcon('star', color, focused),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => renderIcon('user', color, focused),
        }}
      />
    </Tabs>
  );
}
