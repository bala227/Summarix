import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const { isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch("http://192.168.1.6:8000/summarix/favorites/", {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setFavorites(data);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? "#121212" : "#f9f9f9",
        }}
      >
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#f9f9f9", padding: 16,paddingBottom:50 }}>
      <Text
        style={{
          color: isDark ? "#fff" : "#111",
          marginTop:40,
          marginBottom:20
        }}
        className="font-pbold text-3xl"
      >
        Your Favorites
      </Text>

      {favorites.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="star-outline" size={80} color="#9ca3af" />
          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: isDark ? "#999" : "#666",
              textAlign: "center",
              paddingHorizontal: 20,
            }}
            className="font-psemibold"
          >
            You haven't liked any news yet. Start exploring and tap the heart to save your favorites here!
          </Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {favorites.map(({ id, title, description, image, url }) => (
            <TouchableOpacity
              key={id}
              activeOpacity={0.8}
              style={{
                backgroundColor: isDark ? "#222" : "#fff",
                borderRadius: 16,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
                overflow: "hidden",
              }}
              onPress={() => {
                router.push({
                  pathname: "/news-detail",
                  params: { url, title, image }
                });
              }}
            >
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: 180 }}
                resizeMode="cover"
              />
              <View style={{ padding: 16 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: isDark ? "#fff" : "#111",
                    marginBottom: 8,
                  }}
                  numberOfLines={2}
                  className="font-psemibold"
                >
                  {title}
                </Text>
                <Text
                  style={{ color: isDark ? "#ccc" : "#555", fontSize: 14 }}
                  numberOfLines={3}
                  className="font-psemibold"
                >
                  {description}
                </Text>
                <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="star" size={20} color="orange" />
                  <Text style={{ marginLeft: 6, color: isDark ? "#fff" : "#111" }}>Liked</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
