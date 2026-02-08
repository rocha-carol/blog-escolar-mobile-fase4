import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ToastProvider } from "./src/contexts/ToastContext";
import { ManagementAuthProvider } from "./src/contexts/ManagementAuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { useFonts } from "expo-font";
import {
  Fredoka_400Regular,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ToastProvider>
        <ManagementAuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </ManagementAuthProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
