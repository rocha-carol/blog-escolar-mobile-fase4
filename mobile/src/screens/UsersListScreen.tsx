import React, { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import colors from "../theme/colors";
import { deleteUser, fetchUsers } from "../services/users";
import type { UserRole, User } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const UsersListScreen: React.FC<{ role: UserRole }> = ({ role }) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  const loadUsers = async (nextPage = 1) => {
    setLoading(true);
    try {
      const response = await fetchUsers({ role, page: nextPage, limit });
      setHasMore(response.hasMore);
      setPage(response.page);
      setUsers((prev) => (nextPage === 1 ? response.items : [...prev, ...response.items]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, [role]);

  useEffect(() => {
    if (user && user.role !== "professor") {
      Alert.alert("Acesso restrito", "Apenas professores podem gerenciar usuários.");
      navigation.navigate("Posts");
    }
  }, [navigation, user]);

  const handleDelete = (userId: string) => {
    Alert.alert("Excluir", "Deseja remover este usuário?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteUser(userId);
          loadUsers(1);
        },
      },
    ]);
  };

  if (!user || user.role !== "professor") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text>Somente professores podem gerenciar usuários.</Text>
      </View>
    );
  }

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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadUsers(1)} />}
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
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footer}>
              <AppButton title="Carregar mais" onPress={() => loadUsers(page + 1)} disabled={loading} />
            </View>
          ) : null
        }
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
  footer: {
    marginTop: 8,
  },
});

export default UsersListScreen;
