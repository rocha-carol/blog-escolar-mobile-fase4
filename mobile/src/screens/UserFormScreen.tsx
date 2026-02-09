import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { createUser, fetchUser, updateUser } from "../services/users";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";

const UserFormScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { mode, role, userId } = route.params;
  const { user } = useAuth();
  const toast = useToast();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [rm, setRm] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // Flag setada após salvar para permitir navegação sem alerta.
  const skipUnsavedPromptRef = useRef(false);

  // Snapshot inicial do formulário para detectar alterações não salvas.
  const initialRef = useRef<{ nome: string; email: string; rm: string; senha: string } | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    if (user && user.role !== "professor") {
      Alert.alert("Acesso restrito", "Apenas professores podem gerenciar usuários.");
      navigation.navigate("Main");
    }
  }, [navigation, user]);

  useEffect(() => {
    if (mode === "edit" && userId) {
      fetchUser(userId).then((user) => {
        const loadedNome = user.nome ?? "";
        const loadedEmail = user.email ?? "";
        const loadedRm = user.rm ?? "";

        setNome(loadedNome);
        setEmail(loadedEmail);
        setRm(loadedRm);

        initialRef.current = {
          nome: loadedNome,
          email: loadedEmail,
          rm: loadedRm,
          senha: "",
        };
        setInitialLoaded(true);
      });
    } else {
      initialRef.current = null;
      setInitialLoaded(false);
    }
  }, [mode, userId]);

  const isDirty = useMemo(() => {
    if (mode !== "edit") return false;
    if (role !== "aluno") return false;
    if (!initialLoaded) return false;

    const initial = initialRef.current;
    if (!initial) return false;

    const nomeNow = nome.trim();
    const emailNow = email.trim();
    const rmNow = rm.trim();

    const nomeInitial = initial.nome.trim();
    const emailInitial = initial.email.trim();
    const rmInitial = initial.rm.trim();

    const senhaNow = senha;
    const senhaInitial = initial.senha;

    return (
      nomeNow !== nomeInitial ||
      emailNow !== emailInitial ||
      rmNow !== rmInitial ||
      senhaNow !== senhaInitial
    );
  }, [email, initialLoaded, mode, nome, rm, role, senha]);

  useUnsavedChangesGuard({
    navigation,
    enabled: mode === "edit" && role === "aluno",
    hasUnsavedChanges: isDirty,
    allowExitWithoutPromptRef: skipUnsavedPromptRef,
  });

  if (!user || user.role !== "professor") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text>Somente professores podem cadastrar ou editar usuários.</Text>
      </ScrollView>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === "edit" && userId) {
        if (role === "aluno") {
          if (!rm.trim()) {
            Alert.alert("Atenção", "Informe o RM do aluno.");
            return;
          }
          await updateUser(userId, { nome, role, rm: rm.trim() });
        } else {
          await updateUser(userId, { nome, email, role, senha: senha || undefined });
        }
        toast.show("Usuário atualizado com sucesso.", { variant: "success" });
      } else {
        if (role === "professor") {
          const emailTrim = email.trim();
          if (!emailTrim) {
            Alert.alert("Atenção", "Informe o email do professor.");
            return;
          }
          await createUser({ nome, email: emailTrim, role: "professor" });
          toast.show("Professor cadastrado com sucesso.", { variant: "success" });
        } else {
          const rmTrim = rm.trim();
          if (!rmTrim) {
            Alert.alert("Atenção", "Informe o RM do aluno.");
            return;
          }
          await createUser({ nome, rm: rmTrim, role: "aluno" });
          toast.show("Aluno cadastrado com sucesso.", { variant: "success" });
        }
      }

      skipUnsavedPromptRef.current = true;
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>
        {mode === "edit"
          ? `Editar ${role === "professor" ? "professor" : "aluno"}`
          : `Novo ${role === "professor" ? "professor" : "aluno"}`}
      </Text>
      {mode === "edit" && role === "professor" ? (
        <Text style={styles.subtitle}>Página de edição de professores</Text>
      ) : null}
      <View style={styles.card}>
        <AppInput label="Nome" value={nome} onChangeText={setNome} placeholder="Nome completo" />
        {role === "professor" ? (
          <>
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
            {mode === "edit" ? (
              <AppInput
                label="Nova senha (opcional)"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
              />
            ) : null}
          </>
        ) : (
          <AppInput
            label="RM"
            value={rm}
            onChangeText={setRm}
            placeholder="RM do aluno"
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="none"
          />
        )}
        <AppButton
          title={loading ? "Salvando..." : mode === "edit" && role === "professor" ? "Salvar alterações" : "Salvar"}
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
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
    fontWeight: "600",
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

export default UserFormScreen;
