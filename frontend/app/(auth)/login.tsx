import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
  if (!username || !password) {
    Toast.show({
      type: 'error',
      text1: 'Missing Fields',
      text2: 'Please fill in all fields.',
      visibilityTime: 3000,
    });
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://your-ip:8000/summarix/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      await AsyncStorage.setItem('accessToken', data.access);

      Toast.show({
        type: 'custom_success',
        text1: 'Login Successful',
        text2: `Welcome to Summarix, ${username}!`,
        visibilityTime: 2000,
      });

      setTimeout(() => {
        router.replace("/Home"); // Update this to your correct home route
      }, 2000); // Delay to show toast
    } else {
      Toast.show({
        type: 'custom_error',
        text1: 'Login Failed',
        text2: data.detail || 'Invalid credentials.',
        visibilityTime: 3000,
      });
    }
  } catch (error) {
    Toast.show({
      type: 'custom_error',
      text1: 'Connection Error',
      text2: 'Failed to connect to the server.',
      visibilityTime: 3000,
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : -40}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white px-6 justify-start pt-16">
          {/* Header */}
          <View className="flex-row items-center justify-center">
            <Text className="text-4xl text-black font-pbold text-center">
              Summarix
            </Text>
            <Ionicons name="newspaper-outline" size={24} style={{ marginLeft: 8 }} />
          </View>

          {/* Animation */}
          <View className="w-full items-center mb-8 -mt-6">
            <LottieView
              source={require("../../assets/animations/news.json")}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          </View>

          {/* Title */}
          <Text className="text-2xl -mt-10 text-black font-psemibold text-center pb-16">
            <Text className="font-pbold">Sign in</Text> to stay updated with the latest news.
          </Text>

          {/* Inputs */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
            className="w-full gap-4"
          >
            {/* Email */}
            <View className="flex-row items-center border border-black rounded-2xl px-4 py-3 bg-white shadow-md">
              <FontAwesome5 name="envelope" size={20} color="black" />
              <TextInput
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                className="ml-3 flex-1 text-black font-pregular"
                placeholderTextColor="#888"
              />
            </View>

            {/* Password */}
            <View className="flex-row items-center border border-black rounded-2xl px-4 py-3 bg-white shadow-md">
              <FontAwesome5 name="lock" size={20} color="black" />
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="ml-3 flex-1 text-black font-pregular"
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome5
                  name={showPassword ? "eye-slash" : "eye"}
                  size={20}
                  color="black"
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Login Button */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-black mt-20 rounded-full py-4 px-10 shadow-lg"
            >
              <Text className="text-center font-psemibold text-white text-lg">
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-gray-700 font-pregular">Don't have an account? </Text>
            <Link href="/(auth)/register">
              <Text className="text-black font-psemibold underline">Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
