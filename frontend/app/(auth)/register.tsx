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
import Toast from 'react-native-toast-message';
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleRegister = async () => {
  if (!username || !email || !password) {
    Toast.show({
      type: 'custom_error',
      text1: 'Error',
      text2: 'Please fill in all fields.',
    });
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://your-ip:8000/summarix/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      Toast.show({
        type: 'custom_success',
        text1: 'Account created successfully.',
        text2: 'Login to explore',
      });
      setTimeout(() => {
        router.push('/(auth)/login');
      }, 2000);
    } else {
      Toast.show({
        type: 'custom_error',
        text1: 'Registration Failed',
        text2: data.detail || 'Please try again.',
      });
    }
  } catch (error) {
    Toast.show({
      type: 'custom_error',
      text1: 'Error',
      text2: 'Failed to connect to server.',
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 bg-white px-6 justify-start pt-16">
          {/* Title & Lottie */}
          <View className="flex-row items-center justify-center">
            <Text className="text-4xl text-black font-pbold text-center">Summarix</Text>
            <Ionicons name="newspaper-outline" size={24} style={{ marginLeft: 8 }} />
          </View>

          <View className="w-full items-center mb-8 -mt-6">
            <LottieView
              source={require("../../assets/animations/news.json")}
              autoPlay
              loop
              style={{ width: 250, height: 250 }}
            />
          </View>

          {/* Subtitle */}
          <Text className="text-2xl -mt-10 text-black font-psemibold text-center pb-16">
            Want to catch some exciting news? <Text className="font-pbold">Sign Up</Text> now!
          </Text>

          {/* Input Fields */}
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
            className="w-full gap-4"
          >
            {/* Username */}
            <View className="flex-row items-center border border-black rounded-2xl px-4 py-3 bg-white shadow-md">
              <FontAwesome5 name="user" size={20} color="black" />
              <TextInput
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                className="ml-3 flex-1 text-black font-pregular"
                placeholderTextColor="#888"
              />
            </View>

            {/* Email */}
            <View className="flex-row items-center border border-black rounded-2xl px-4 py-3 bg-white shadow-md">
              <FontAwesome5 name="envelope" size={20} color="black" />
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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

          {/* Register Button */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="bg-black mt-10 rounded-full py-4 px-10 shadow-lg"
            >
              <Text className="text-center font-psemibold text-white text-lg">
                {loading ? "Creating..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-gray-700 font-pregular">Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text className="text-black font-psemibold underline">Sign in</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
