import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";

type LoginRole = "professor" | "aluno";

const LoginScreen: React.FC = () => {
  const { login, continueAsStudent, logout, user } = useAuth();
  const navigation = useNavigation<any>();

  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [firstAccessModalVisible, setFirstAccessModalVisible] = useState(false);
  const [firstAccessEmail, setFirstAccessEmail] = useState("");
  const [firstAccessSenha, setFirstAccessSenha] = useState("");
  const [firstAccessConfirm, setFirstAccessConfirm] = useState("");
  const [studentNome, setStudentNome] = useState("");
  const [studentRm, setStudentRm] = useState("");

  const handleLogin = async () => {
    const emailTrim = email.trim();

    if (!emailTrim || !senha) {
      Alert.alert("Atenção", "Informe email e senha.");
      return;
    }

    setLoading(true);
    try {
      await login(emailTrim, senha);
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const openFirstAccessModal = useCallback(() => {
    setFirstAccessEmail(email.trim());
    setFirstAccessSenha("");
    setFirstAccessConfirm("");
    setFirstAccessModalVisible(true);
  }, [email]);

  const closeFirstAccessModal = useCallback(() => {
    setFirstAccessModalVisible(false);
  }, []);

  const handleFirstAccess = useCallback(async () => {
    const emailTrim = firstAccessEmail.trim();
    const senhaTrim = firstAccessSenha;
    const confirmTrim = firstAccessConfirm;

    if (!emailTrim || !senhaTrim) {
      Alert.alert("Atenção", "Informe email e a nova senha.");
      return;
    }

    if (senhaTrim.length < 6) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senhaTrim !== confirmTrim) {
      Alert.alert("Atenção", "As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { firstAccess } = await login(emailTrim, senhaTrim);
      closeFirstAccessModal();

      if (firstAccess) {
        Alert.alert("Sucesso", "Senha criada no primeiro acesso. Você já está logado.");
      }

      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar a senha. Verifique o email informado.");
    } finally {
      setLoading(false);
    }
  }, [closeFirstAccessModal, firstAccessConfirm, firstAccessEmail, firstAccessSenha, login, navigation]);

  const handleContinueAsStudent = useCallback(async () => {
    const nomeTrim = studentNome.trim();
    const rmTrim = studentRm.trim();

    if (!nomeTrim) {
      Alert.alert("Atenção", "Informe o nome completo do aluno.");
      return;
    }

    if (!rmTrim) {
      Alert.alert("Atenção", "Informe o RM do aluno.");
      return;
    }

    setLoading(true);
    try {
      await continueAsStudent(nomeTrim, rmTrim);
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (error) {
      Alert.alert("Erro", "Aluno não encontrado. Verifique se o RM e o nome estão cadastrados.");
    } finally {
      setLoading(false);
    }
  }, [continueAsStudent, navigation, studentNome, studentRm]);

  const handleBackToRoleSelection = useCallback(() => {
    setSelectedRole(null);
    setLoading(false);
  }, []);

  const handleContinueSavedSession = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  }, [navigation]);

  const handleSwitchUser = useCallback(async () => {
    setLoading(true);
    try {
      await logout();
      handleBackToRoleSelection();
    } finally {
      setLoading(false);
    }
  }, [handleBackToRoleSelection, logout]);

  const getUserLabel = () => {
    if (!user) return "";
    const roleLabel = user.role === "professor" ? "Professor" : "Aluno";
    const ident = user.nome || user.email || "usuário";
    return `${roleLabel}: ${ident}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <View style={styles.page}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContentCentered}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <View style={styles.header}>
                <Text style={styles.title}>Blog Escolar</Text>
                <Text style={styles.subtitle}>Escolha como deseja entrar</Text>
              </View>
              <View style={styles.card}>
                {selectedRole === null && (
                  <>
                    {user && (
                      <>
                        <AppButton
                          title={`Continuar como ${getUserLabel()}`}
                          onPress={handleContinueSavedSession}
                          disabled={loading}
                          variant="primary"
                        />

                        <View style={styles.spacer} />
                        <AppButton
                          title="Trocar usuário"
                          onPress={handleSwitchUser}
                          disabled={loading}
                          variant="secondary"
                        />

                        <View style={styles.divider} />
                      </>
                    )}

                    <AppButton
                      title="Sou professor"
                      onPress={() => setSelectedRole("professor")}
                      disabled={loading}
                      variant="primary"
                    />

                    <View style={styles.spacer} />
                    <AppButton
                      title="Sou aluno"
                      onPress={() => setSelectedRole("aluno")}
                      disabled={loading}
                      variant="secondary"
                    />
                  </>
                )}

                {selectedRole === "professor" && (
                  <>
                    <Text style={styles.sectionTitle}>Professor</Text>
                    <Text style={styles.sectionSubtitle}>Entre com email e senha.</Text>

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
                    <AppInput
                      label="Senha"
                      value={senha}
                      onChangeText={setSenha}
                      secureTextEntry
                      placeholder="Sua senha"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="password"
                    />
                    <AppButton
                      title={loading ? "Entrando..." : "Entrar"}
                      onPress={handleLogin}
                      disabled={loading}
                    />

                    <View style={styles.spacer} />
                    <AppButton
                      title="Primeiro acesso"
                      onPress={openFirstAccessModal}
                      disabled={loading}
                      variant="secondary"
                    />
                  </>
                )}

                {selectedRole === "aluno" && (
                  <>
                    <Text style={styles.sectionTitle}>Aluno</Text>
                    <Text style={styles.sectionSubtitle}>Entre com nome e RM.</Text>

                    <AppInput
                      label="Nome completo"
                      value={studentNome}
                      onChangeText={setStudentNome}
                      placeholder="Seu nome completo"
                      autoCapitalize="words"
                      autoCorrect={false}
                      textContentType="name"
                    />

                    <AppInput
                      label="RM"
                      value={studentRm}
                      onChangeText={setStudentRm}
                      placeholder="000000"
                      keyboardType="numeric"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="none"
                    />

                    <AppButton
                      title={loading ? "Entrando..." : "Entrar"}
                      onPress={handleContinueAsStudent}
                      disabled={loading}
                    />
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          {selectedRole !== null && (
            <View style={styles.footer}>
              <AppButton
                title="Voltar"
                onPress={handleBackToRoleSelection}
                disabled={loading}
                variant="secondary"
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal visible={firstAccessModalVisible} transparent animationType="fade" onRequestClose={closeFirstAccessModal}>
        <Pressable style={styles.backdrop} onPress={closeFirstAccessModal}>
          <Pressable style={styles.modalCard} onPress={() => null}>
            <Text style={styles.modalTitle}>Primeiro acesso</Text>
            <Text style={styles.modalSubtitle}>Crie sua senha para entrar.</Text>

            <AppInput
              label="Email"
              value={firstAccessEmail}
              onChangeText={setFirstAccessEmail}
              placeholder="professor@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            <AppInput
              label="Nova senha"
              value={firstAccessSenha}
              onChangeText={setFirstAccessSenha}
              secureTextEntry
              placeholder="Crie uma senha"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />

            <AppInput
              label="Confirmar senha"
              value={firstAccessConfirm}
              onChangeText={setFirstAccessConfirm}
              secureTextEntry
              placeholder="Repita a senha"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />

            <View style={styles.actions}>
              <View style={styles.actionBtn}>
                <AppButton title="Cancelar" onPress={closeFirstAccessModal} variant="secondary" size="sm" />
              </View>
              <View style={styles.actionBtn}>
                <AppButton
                  title={loading ? "Salvando..." : "Criar e entrar"}
                  onPress={handleFirstAccess}
                  variant="primary"
                  size="sm"
                  disabled={loading}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
    padding: 24,
  },
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 64,
    paddingBottom: 160, // Sobe mais o conteúdo
  },
  footer: {
    paddingTop: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  spacer: {
    height: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
    opacity: 0.8,
  },


  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.muted,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionBtn: {
    minWidth: 96,
  },
});

export default LoginScreen;
