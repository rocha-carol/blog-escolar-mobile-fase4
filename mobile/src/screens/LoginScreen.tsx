import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email.trim(), senha);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blog Escolar</Text>
      <Text style={styles.subtitle}>Acesso para docentes e estudantes</Text>
      <AppInput label="Email" value={email} onChangeText={setEmail} placeholder="professor@email.com" />
      <AppInput label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="Sua senha" />
      <AppButton title={loading ? "Entrando..." : "Entrar"} onPress={handleLogin} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 32,
  },
});

export default LoginScreen;
