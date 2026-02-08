import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import colors from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";

const AccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Main" }] });
        },
      },
    ]);
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Conta</Text>

        {user ? (
          <>
            <Text style={styles.text}>Você está logado como:</Text>
            <Text style={styles.highlight}>{user.nome}</Text>
            <Text style={styles.text}>Perfil: {user.role}</Text>

            <View style={styles.spacer} />
            <AppButton title="Sair" onPress={handleLogout} variant="danger" />
          </>
        ) : (
          <>
            <Text style={styles.text}>
              Você está navegando como estudante/visitante. Para administrar postagens e usuários, entre como professor.
            </Text>
            <View style={styles.spacer} />
            <AppButton title="Entrar como professor" onPress={handleLogin} variant="secondary" />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  text: {
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  highlight: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 6,
  },
  spacer: {
    height: 12,
  },
});

export default AccountScreen;
