import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";

// Botão de login/logout exibido no cabeçalho do app
const HeaderLogoutButton: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  // Função chamada ao clicar em sair
  const handleLogout = () => {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  // Função chamada ao clicar em login
  const handleLogin = () => {
    navigation.navigate("Login");
  };

  // Pega o nome do usuário logado
  const fullName = user?.nome?.trim() ?? "";

  return (
    <View style={styles.container}>
      {/* Exibe nome do usuário e ícone */}
      <View style={styles.userWrap}>
        <Ionicons name="person-circle-outline" size={16} color={colors.secondary} />
        <Text style={styles.userName} numberOfLines={2}>
          {fullName || "login"}
        </Text>
      </View>
      {/* Botão de login ou logout */}
      <Pressable
        onPress={user ? handleLogout : handleLogin}
        style={styles.button}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={user ? "Sair" : "Entrar"}
      >
        <Ionicons
          name={user ? "log-out-outline" : "log-in-outline"}
          size={22}
          color={colors.secondary}
        />
      </Pressable>
    </View>
  );
};

// Estilos do botão e do nome do usuário
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 260,
  },
  userWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 2,
    maxWidth: 210,
  },
  userName: {
    fontWeight: "400",
    fontStyle: "italic",
    color: colors.secondary,
    fontSize: 12,
    lineHeight: 14,
    textAlign: "right",
    maxWidth: 210,
  },
  button: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
});

export default HeaderLogoutButton;
