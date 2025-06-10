import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const [showAbout, setShowAbout] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ favorites: 0, comments: 0 });
  const [loading, setLoading] = useState(true);

  const ME_URL = "http://your-ip:8000/summarix/me";
  const STATS_URL = "http://your-ip:8000/summarix/user-stats/";

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userToken = await AsyncStorage.getItem("accessToken");
        if (!userToken) {
          throw new Error("No access token found. Please login again.");
        }

        // Fetch user info
        const userRes = await fetch(ME_URL, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user info");
        const userData = await userRes.json();

        // Fetch user stats
        const statsRes = await fetch(STATS_URL, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (!statsRes.ok) throw new Error("Failed to fetch user stats");
        const statsData = await statsRes.json();

        setUser(userData);
        setStats(statsData);
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");

    Toast.show({
      type: "custom_success",
      text1: "Logged out",
      text2: "You have been logged out successfully 👋",
      visibilityTime: 2000,
    });

    setTimeout(() => {
      router.push("/login");
    }, 2000); // delay navigation to let toast be visible
  };

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-black" : "bg-white"
        }`}
      >
        <ActivityIndicator size="large" color={isDark ? "white" : "black"} />
      </View>
    );
  }

  if (!user) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-black" : "bg-white"
        }`}
      >
        <Text className={`${isDark ? "text-white" : "text-black"}`}>
          No user data available
        </Text>
      </View>
    );
  }

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fafafa" }}
    >
      {/* Header with Cover + Avatar */}
      <View
        style={{ height: 180, backgroundColor: isDark ? "#1f1f1f" : "#e0e0e0" }}
      >
        <Image
          source={require("../../assets/images/profile-cover1.jpg")}
          style={{ flex: 1, width: "100%" }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            bottom: -40,
            left: "50%",
            transform: [{ translateX: -40 }],
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark ? "#333" : "#fff",
              justifyContent: "center",
              alignItems: "center",
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 32, color: isDark ? "#eee" : "#333" }}>
              {initial}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 40, paddingHorizontal: 24 }}>
        {/* Username & Email */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: isDark ? "#eee" : "#222",
            textAlign: "center",
          }}
          className="font-pbold"
        >
          {user.username}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: isDark ? "#aaa" : "#555",
            marginTop: 4,
            textAlign: "center",
          }}
          className="font-psemibold"
        >
          {user.email}
        </Text>

        {/* Stats Section */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginVertical: 24,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <MaterialIcons name="star" size={28} color="#fbbf24" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: isDark ? "#eee" : "#222",
              }}
              className="font-psemibold"
            >
              {stats.favorites}
            </Text>
            <Text
              style={{ fontSize: 12, color: isDark ? "#aaa" : "#555" }}
              className="font-psemibold"
            >
              Favorites
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <MaterialIcons name="comment" size={28} color="#34d399" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: isDark ? "#eee" : "#222",
              }}
              className="font-psemibold"
            >
              {stats.comments}
            </Text>
            <Text
              style={{ fontSize: 12, color: isDark ? "#aaa" : "#555" }}
              className="font-psemibold"
            >
              Comments
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingBottom: 20,
            marginTop: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowAbout((prev) => !prev)}
            activeOpacity={0.9}
            className="flex-row justify-between items-center bg-zinc-200 dark:bg-zinc-800 px-4 py-4 rounded-xl mb-4 shadow-sm"
          >
            <Text className="text-base font-psemibold text-zinc-800 dark:text-zinc-100">
              About Summarix
            </Text>
            <MaterialIcons
              name={showAbout ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={24}
              color={isDark ? "#ccc" : "#fff"}
            />
          </TouchableOpacity>

          {showAbout && (
            <View className="bg-zinc-200 dark:bg-zinc-800 px-4 py-8 rounded-xl mb-4 shadow-sm w-full ">
              <Text className="text-sm text-center text-zinc-700 dark:text-zinc-300 font-pregular leading-relaxed mb-4">
                Summarix is a smart summarization app that helps you quickly
                digest the key points from long articles and content. Track your
                reading stats, favorites, and comments all in one place.
              </Text>

              <View className="flex-row justify-center items-center mt-2">
                <Text className="text-sm text-zinc-600 dark:text-zinc-400 font-pregular">
                  Developed with <Text className="text-red-500">❤️</Text> by{" "}
                </Text>
                <Text className="text-sm text-zinc-900 dark:text-white font-pbold ml-1">
                  Bala Subramanian S
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#dc2626",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            shadowColor: "#dc2626",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            marginBottom: 40,
          }}
        >
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: "600",
              marginLeft: 8,
            }}
            className="font-pbold"
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
