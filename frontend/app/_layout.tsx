import React, { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Toast from 'react-native-toast-message';
import { CustomToast } from '../components/CustomToast'; // adjust path if needed
import { useTheme } from "@/contexts/ThemeContext";

const toastConfig = {
  custom_success: (props) => <CustomToast {...props} type="success" />,
  custom_error: (props) => <CustomToast {...props} type="error" />,
};


function Root() {
  // This is inside AuthProvider, so useAuth works here
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name={isAuthenticated ? "(tabs)" : "(auth)"} />
    </Stack>
  );
}

export default function RootLayout() {
  const { isDark } = useTheme();
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Poppins-BoldItalic": require("../assets/fonts/Poppins-BoldItalic.ttf"),
    "Poppins-SemiBoldItalic": require("../assets/fonts/Poppins-SemiBoldItalic.ttf"),
    "Poppins-MediumItalic": require("../assets/fonts/Poppins-MediumItalic.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;
 
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isDark } = useTheme(); // ✅ Now it's safe to use here

  return (
    <>
      <Root />
      <StatusBar style={isDark ? "light" : "dark"} /> {/* 🔥 Dynamic */}
      <Toast config={toastConfig} />
    </>
  );
}
