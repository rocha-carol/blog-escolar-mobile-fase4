import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import colors from "../theme/colors";
import { useManagementAuth } from "../contexts/ManagementAuthContext";
import UsersListScreen from "./UsersListScreen";

const StudentManagementProtectedScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isAuthorized, ensureAuthorized, resetAuthorization } = useManagementAuth();

  // Reset da autorização ao sair da aba para exigir senha novamente na próxima entrada.
  useEffect(() => {
    return () => {
      resetAuthorization();
    };
  }, [resetAuthorization]);

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

  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Autorização necessária</Text>
        <Text style={styles.text}>Digite a senha para acessar o gerenciamento.</Text>
      </View>
    );
  }

  return <UsersListScreen role="aluno" />;
};

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

export default StudentManagementProtectedScreen;
