import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const categories = [
  { id: "business", title: "Business" },
  { id: "technology", title: "Technology" },
  { id: "sports", title: "Sports" },
  { id: "entertainment", title: "Entertainment" },
  { id: "health", title: "Health" },
  { id: "science", title: "Science" },
  { id: "politics", title: "Politics" },
  { id: "world", title: "World" },
  { id: "finance", title: "Finance" },
  { id: "travel", title: "Travel" },
];

const API_KEY = "your-api";

export default function HomeScreen() {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("business");
  const [newsData, setNewsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentStreak, setCurrentStreak] = useState(0);
  const [fireBurst, setFireBurst] = useState(false);
  const fireAnimValues = useRef(
    Array.from({ length: 25 }, () => new Animated.Value(0))
  ).current;

  // Fetch news on category change
  useEffect(() => {
    fetchNews();
    fetchCurrentStreak();
  }, [selectedCategory]);

  // Sync filtered data with newsData when newsData changes (like after fetch)
  useEffect(() => {
    setFilteredData(newsData);
  }, [newsData]);

  // Animate fade when filteredData changes
  useEffect(() => {
    fadeAnim.setValue(0); // reset animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [filteredData]);

  const fetchCurrentStreak = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch("http://your-ip:8000/summarix/streak/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStreak(data.streak);
      } else {
        console.warn("Failed to fetch streak:", data);
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };

  const triggerFireAnimation = () => {
    setFireBurst(true);

    const animations = fireAnimValues.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 3000, // 3 seconds
        useNativeDriver: true,
      })
    );

    Animated.stagger(50, animations).start(() => {
      setFireBurst(false);
      fireAnimValues.forEach((anim) => anim.setValue(0));
    });
  };

  useEffect(() => {
    fetchCurrentStreak();
  }, []);

  const handleDailyCheckIn = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(
        "http://your-ip:8000/summarix/daily-check-in/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.streak > currentStreak) {
          triggerFireAnimation(); // 🎉 fire emoji burst here
        }

        setCurrentStreak(data.streak);
        Toast.show({
          type: "custom_success",
          text1: "Daily Check-In Successful ✅",
          position: "top",
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: "custom_error",
          text1: "⚠️ Check-In Failed",
          text2: data.message || "Please try again later",
          position: "top",
          visibilityTime: 3000,
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "custom_error",
        text1: "🚨 Something went wrong!",
        text2: "Unable to check in. Please try again.",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=${selectedCategory}&apiKey=${API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();

      const formatted = json.articles.map((article, idx) => ({
        id: article.url || idx.toString(),
        title: article.title || "No Title",
        summary: article.description || "No Description",
        image: article.urlToImage
          ? { uri: article.urlToImage }
          : require("../../assets/images/news-default.jpg"),
        content: article.content || "",
        url: article.url,
      }));

      setNewsData(formatted);
      setSearchQuery(""); // Reset search input on new data
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    const trimmedText = text.trim();
    setSearchQuery(text); // Show full text in input

    if (!trimmedText) {
      setFilteredData(newsData);
      return;
    }

    const lowerSearch = trimmedText.toLowerCase();

    const filtered = newsData.filter((item) => {
      return (
        item.title?.toLowerCase().includes(lowerSearch) ||
        item.summary?.toLowerCase().includes(lowerSearch)
      );
    });

    setFilteredData(filtered);
  };

  const renderNewsItem = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/news-detail",
            params: {
              newsId: item.id,
              title: item.title,
              summary: item.summary,
              image: item.image.uri,
              content: item.content,
              url: item.url,
            },
          })
        }
        style={{ 
          marginBottom: 24, 
          borderRadius: 20, 
          overflow: "hidden",
           
        }}
      >
        <BlurView
          tint={isDark ? "dark" : "light"}
          intensity={Platform.OS === "ios" ? 80 : 100}
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
            borderRadius: 20,
            
          }}
        >
          <Image
            source={item.image}
            style={{
              width: "100%",
              height: 200,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
            resizeMode="cover"
          />

          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: isDark ? "#fff" : "#111",
                marginBottom: 8,
              }}
              numberOfLines={2}
              className="font-psemibold"
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: isDark ? "#aaa" : "#444",
              }}
              numberOfLines={3}
              className="font-pregular"
            >
              {item.summary}
            </Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategoryItem = ({ item }) => {
    const isSelected = item.id === selectedCategory;
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedCategory(item.id);
          setSearchQuery("");
        }}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: isSelected
            ? isDark
              ? "#fff"
              : "#111"
            : isDark
            ? "#333"
            : "#eee",
          marginRight: 10,
        }}
      >
        <Text
          style={{
            color: isSelected
              ? isDark
                ? "#000"
                : "#fff"
              : isDark
              ? "#ccc"
              : "#333",
            fontSize: 14,
          }}
          className="font-psemibold"
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0f0f0f" : "#fefefe",
        paddingHorizontal: 16,
        paddingTop: 40,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{ fontSize: 24, color: isDark ? "#fff" : "#222" }}
              className="font-pbold"
            >
              Summarix
            </Text>
            <Ionicons
              name="newspaper-outline" // or any icon name you like
              size={24}
              color={isDark ? "#fff" : "#222"}
              style={{ marginLeft: 8 }}
            />
          </View>
          <Text
            style={{ fontSize: 14, color: isDark ? "#aaa" : "#666" }}
            className="font-psemibold"
          >
            Discover top news across the world
          </Text>
        </View>
        <ThemeToggle />
      </View>

      <DailyCheckInButton
        onPress={handleDailyCheckIn}
        streak={currentStreak}
        isDark={isDark}
      />

      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: isDark ? "#222" : "#efefef",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 5,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Ionicons name="search" size={20} color={isDark ? "#ccc" : "#888"} />
        <TextInput
          placeholder="Search News..."
          placeholderTextColor={isDark ? "#777" : "#aaa"}
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 15,
            color: isDark ? "#fff" : "#000",
          }}
          value={searchQuery}
          onChangeText={handleSearch} // search as user types
        />
        <Ionicons
          name="options-outline"
          size={20}
          color={isDark ? "#ccc" : "#888"}
        />
      </View>

      {/* Categories */}
      <View style={{ marginTop: 20 }}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          className="pb-4"
        />
      </View>

      {/* News List */}
      {loading ? (
        <View
          style={{
            height: 150,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 100,
          }}
        >
          <LottieView
            source={require("../../assets/animations/loading.json")}
            autoPlay
            loop
            style={{ width: 100, height: 100 }}
          />
          <View className="flex-row items-center -mt-5">
            <Text
              style={{
                color: isDark ? "white" : "black",
              }}
              className="font-psemibold text-lg"
            >
              Loading{" "}
            </Text>
            <Ionicons
              name="newspaper-outline" // or any icon name you like
              size={24}
              color={isDark ? "#fff" : "#222"}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderNewsItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 80 }}
        />
      )}
      {fireBurst && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: 60,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          {fireAnimValues.map((anim, index) => {
            const randomX = (Math.random() - 0.5) * 300; // Spread horizontally
            const randomY = -150 - Math.random() * 300; // Go upward randomly
            const rotate = Math.random() * 360;

            const translateY = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, randomY],
            });

            const translateX = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, randomX],
            });

            const opacity = anim.interpolate({
              inputRange: [0, 0.9, 1],
              outputRange: [1, 1, 0],
            });

            const rotateInterpolate = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [`0deg`, `${rotate}deg`],
            });

            return (
              <Animated.Text
                key={index}
                style={{
                  position: "absolute",
                  fontSize: 32,
                  transform: [
                    { translateY },
                    { translateX },
                    { rotate: rotateInterpolate },
                  ],
                  opacity,
                }}
              >
                🔥
              </Animated.Text>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const DailyCheckInButton = ({ onPress, streak = 0, isDark = false }) => {
  return (
    <View
      style={{
        marginTop: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <View style={{ flex: 1, alignItems: "flex-start" }}>
        <TouchableOpacity
          onPress={onPress}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: isDark ? "#1e90ff" : "#007bff",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Daily Check-In 🔥
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
        <Text
          style={{
            color: isDark ? "#fff":"#333",
            fontWeight: "bold",
            fontSize: 20,
            marginRight: 4,
          }}
        >
          {streak}
        </Text>
        <LottieView
          source={require("../../assets/animations/fire.json")} // 👈 Update path to your Lottie fire JSON
          autoPlay
          loop
          style={{ width: 28, height: 28, marginTop:-6 }}
        />
      </View>
    </View>
  );
};
