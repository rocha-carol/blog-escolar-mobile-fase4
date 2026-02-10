import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import colors from "../theme/colors";
import { useManagementAuth } from "../contexts/ManagementAuthContext";
import UsersListScreen from "./UsersListScreen";

// Componente principal para proteger área de gerenciamento de usuários
const UserManagementProtectedScreen: React.FC = () => {
  // Navegação e autenticação de gerenciamento
  const navigation = useNavigation<any>();
  const { isAuthorized, ensureAuthorized, resetAuthorization } = useManagementAuth();

  // Reseta autorização ao sair da aba
  useEffect(() => {
    return () => {
      resetAuthorization();
    };
  }, [resetAuthorization]);

  // Garante autorização ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      (async () => {
        if (isAuthorized) return;
        const ok = await ensureAuthorized();
        if (!ok && mounted) {
          navigation.navigate("Posts");
        }
      })();

      return () => {
        mounted = false;
      };
    }, [ensureAuthorized, isAuthorized, navigation])
  );

  // Exibe mensagem se não estiver autorizado
  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Autorização necessária</Text>
        <Text style={styles.text}>Digite a senha para acessar o gerenciamento.</Text>
      </View>
    );
  }

  return <UsersListScreen role="professor" />;
};

// Estilos para cada parte da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  text: {
    color: colors.muted,
    textAlign: "center",
  },
});

// Exporta o componente para ser usado em outras telas
export default UserManagementProtectedScreen;
