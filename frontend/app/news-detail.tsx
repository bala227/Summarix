import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NewsDetail() {
  const router = useRouter();
  const { title, image, content, url } = useLocalSearchParams();
  const { isDark } = useTheme();

  const [hasLiked, setHasLiked] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAllComments, setShowAllComments] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (url) {
      fetchSummary();
      fetchLikesAndComments();
    }
  }, [url]);

  const fetchLikesAndComments = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(
        `http://your-ip:8000/summarix/news-meta/?url=${encodeURIComponent(
          url
        )}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );
      const data = await response.json();
      setLikes(data.likes || 0);
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setHasLiked(!!data.has_liked);
    } catch (err) {
      console.error("Failed to load likes/comments", err);
      setComments([]);
    }
  };

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.log("No token found. User not logged in.");
        return;
      }

      const response = await fetch("http://your-ip:8000/summarix/like/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, title }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Like failed:", data);
        return;
      }

      if (data.message === "Liked") {
        setLikes((prev) => prev + 1);
        setHasLiked(true);
      } else if (data.message === "Unliked") {
        setLikes((prev) => Math.max(prev - 1, 0));
        setHasLiked(false);
      }
    } catch (error) {
      console.error("Error in liking news:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        console.log("No token found. User not logged in.");
        return;
      }

      const response = await fetch(
        "http://your-ip:8000/summarix/comment/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url, text: newComment, title }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Comment failed:", errorData);
        return;
      }

      // Add new comment locally for instant UI update
      setComments((prevComments) => [
        ...prevComments,
        {
          text: newComment,
          created_at: new Date().toISOString(),
          user__username: "You",
        },
      ]);
      setNewComment("");
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  const gradientColors = isDark ? ["green", "blue"] : ["black", "black"];

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://your-ip:8000/summarix/news-summarize/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok)
        throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary("No summary available.");
      }
    } catch (error) {
      console.error("Summary fetch error:", error.message || error);
      setSummary("Failed to fetch summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#f9f9f9" }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 50,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333" : "#e0e0e0",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: isDark ? "#333" : "#f0f0f0",
            padding: 10,
            borderRadius: 12,
          }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? "#fff" : "#333"}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: isDark ? "#fff" : "#111",
          }}
        >
          News Details
        </Text>
        <View style={{ width: 36 }} /> {/* Placeholder for symmetry */}
      </View>

      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: isDark ? "#222" : "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <BlurView
          tint={isDark ? "dark" : "light"}
          intensity={100}
          style={{ borderRadius: 20 }}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={
                image
                  ? { uri: image }
                  : require("../assets/images/news-illustration.jpg")
              }
              style={{
                width: "100%",
                height: 230,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
              resizeMode="cover"
            />

            <TouchableOpacity
              onPress={handleLike}
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#333" : "#eee",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Ionicons
                name={hasLiked ? "star" : "star-outline"}
                size={18}
                color={hasLiked ? "orange" : isDark ? "#fff" : "#000"}
              />
              <Text style={{ marginLeft: 5, color: isDark ? "#fff" : "#000" }}>
                {likes}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 20 }}>
            <Text
              style={{
                fontSize: 24,
                color: isDark ? "#fff" : "#111",
                marginBottom: 16,
              }}
              className="font-pbold"
            >
              {title || "No Title"}
            </Text>

            {loading ? (
              <View
                style={{
                  height: 150,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 50,
                }}
              >
                <LottieView
                  source={require("../assets/animations/loading.json")}
                  autoPlay
                  loop
                  style={{ width: 100, height: 100 }}
                />
                <Text className="-mt-10 font-psemibold text-lg" style={{ color: isDark ? 'white' : 'black' }}>
                  Loading...
                </Text>
              </View>
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 26,
                    color: isDark ? "#ccc" : "#555",
                    marginBottom: 12,
                  }}
                  className="font-psemibold"
                >
                  {summary}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: isDark ? "#aaa" : "#666",
                    marginBottom: 20,
                  }}
                  className="font-psemibold text-center mt-10"
                >
                  To dive deeper into this news, feel free to read the full
                  article below.
                </Text>
              </View>
            )}

            {url && (
              <TouchableOpacity
                onPress={() => Linking.openURL(url)}
                className="rounded-xl mt-4 overflow-hidden"
              >
                <LinearGradient
                  colors={gradientColors}
                  start={[0, 0]}
                  end={[1, 1]}
                  className="p-4 items-center"
                >
                  <Text className="text-white font-bold text-base">
                    Read Full Article
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            <View style={{ marginTop: 30 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 10,
                  color: isDark ? "#fff" : "#000",
                }}
              >
                Comments
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  alignItems: "center",
                  marginBottom:20
                }}
              >
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Write a comment..."
                  placeholderTextColor={isDark ? "#666" : "#aaa"}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: isDark ? "#444" : "#ccc",
                    borderRadius: 8,
                    padding: 8,
                    color: isDark ? "#fff" : "#000",
                  }}
                />
                <TouchableOpacity onPress={handleAddComment} style={{ marginLeft: 8 }}>
                  <Ionicons
                    name="send"
                    size={22}
                    color={isDark ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              </View>
              {comments.length === 0 && (
                <Text style={{ color: isDark ? "#999" : "#666",textAlign:'center' }}>
                  No comments yet. Be the first!
                </Text>
              )}

              {(showAllComments ? comments : comments.slice(0, 2)).map(
                (c, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 10,
                      backgroundColor: isDark ? "#2a2a2a" : "#f2f2f2",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#888",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        {c.user__username?.charAt(0).toUpperCase() || "?"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: "bold",
                          marginBottom: 4,
                          color: isDark ? "#fff" : "#111",
                        }}
                      >
                        {c.user__username || "Anonymous"}
                      </Text>
                      <Text style={{ color: isDark ? "#ccc" : "#333" }}>
                        {c.text}
                      </Text>
                    </View>
                  </View>
                )
              )}

              {comments.length > 2 && (
                <TouchableOpacity
                  onPress={() => setShowAllComments(!showAllComments)}
                >
                  <Text
                    style={{
                      marginTop: 10,
                      color: "#007BFF",
                      textAlign: "center",
                    }}
                  >
                    {showAllComments ? "Show less" : "Show all comments"}
                  </Text>
                </TouchableOpacity>
              )}

              
            </View>
          </View>
        </BlurView>
      </View>
    </ScrollView>
  );
}
