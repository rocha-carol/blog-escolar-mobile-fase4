import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import colors from "../theme/colors";
import { useManagementAuth } from "../contexts/ManagementAuthContext";
import AppButton from "../components/AppButton";
import UsersListScreen from "./UsersListScreen";
import type { UserRole } from "../types";

const UserManagementProtectedScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isAuthorized, ensureAuthorized, resetAuthorization } = useManagementAuth();
  const [managedRole, setManagedRole] = useState<UserRole>("professor");

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

  return (
    <View style={styles.wrapper}>
      <View style={styles.roleSwitcher}>
        <View style={styles.roleBtn}>
          <AppButton
            title="Professores"
            size="sm"
            variant={managedRole === "professor" ? "primary" : "secondary"}
            onPress={() => setManagedRole("professor")}
          />
        </View>
        <View style={styles.roleBtn}>
          <AppButton
            title="Alunos"
            size="sm"
            variant={managedRole === "aluno" ? "primary" : "secondary"}
            onPress={() => setManagedRole("aluno")}
          />
        </View>
      </View>

      <UsersListScreen role={managedRole} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  roleSwitcher: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  roleBtn: {
    flex: 1,
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

export default UserManagementProtectedScreen;
