import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { createUser } from "../services/users";
import colors from "../theme/colors";

const CreateProfessorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const nomeTrim = nome.trim();
    const emailTrim = email.trim();

    if (!nomeTrim || !emailTrim) {
      Alert.alert("Atenção", "Preencha nome e email para cadastrar o professor.");
      return;
    }

    setLoading(true);
    try {
      await createUser({ nome: nomeTrim, email: emailTrim, role: "professor" });
      toast.show("Professor cadastrado com sucesso.", { variant: "success" });
      navigation.goBack();
    } catch {
      Alert.alert("Erro", "Não foi possível enviar o cadastro ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "professor") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text>Somente professores podem cadastrar outros professores.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Criar professor</Text>
      <View style={styles.card}>
        <AppInput label="Nome" value={nome} onChangeText={setNome} placeholder="Nome completo" />
        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="professor@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
        />
        <AppButton
          title={loading ? "Enviando..." : "Enviar cadastro ao servidor"}
          onPress={handleSubmit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
});

export default CreateProfessorScreen;
