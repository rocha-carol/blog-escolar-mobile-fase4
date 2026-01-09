import React, { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import colors from "../theme/colors";
import { deleteUser, fetchUsers } from "../services/users";
import type { UserRole, User } from "../types";
import { useNavigation } from "@react-navigation/native";

const UsersListScreen: React.FC<{ role: UserRole }> = ({ role }) => {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchUsers({ role });
      setUsers(response.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role]);

  const handleDelete = (userId: string) => {
    Alert.alert("Excluir", "Deseja remover este usuário?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteUser(userId);
          loadUsers();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{role === "professor" ? "Professores" : "Alunos"}</Text>
      <AppButton
        title={role === "professor" ? "Cadastrar professor" : "Cadastrar aluno"}
        onPress={() => navigation.navigate("UserForm", { mode: "create", role })}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardMeta}>{item.email}</Text>
            <View style={styles.actions}>
              <AppButton
                title="Editar"
                onPress={() => navigation.navigate("UserForm", { mode: "edit", role, userId: item.id })}
              />
              <AppButton title="Excluir" variant="danger" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </View>
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
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  cardMeta: {
    color: colors.muted,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
});

export default UsersListScreen;
