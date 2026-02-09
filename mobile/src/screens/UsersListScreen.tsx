// Importa bibliotecas para criar a tela e manipular dados
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { deleteUser, fetchUsers } from "../services/users";
import type { UserRole, User } from "../types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

// Componente principal para listar usuários
const UsersListScreen: React.FC<{ role: UserRole }> = ({ role }) => {
  // Navegação e autenticação
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  // Estados para usuários, carregamento, paginação e busca
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [termo, setTermo] = useState("");
  const [debouncedTermo, setDebouncedTermo] = useState("");
  const limit = 10;

  // Aplica debounce ao termo de busca
  useEffect(() => {
    const trimmed = termo.trim();
    const t = setTimeout(() => {
      setDebouncedTermo(trimmed);
    }, 350);
    return () => clearTimeout(t);
  }, [termo]);

  // Função para buscar usuários
  const loadUsers = useCallback(
    async (nextPage = 1) => {
    setLoading(true);
    try {
      const response = await fetchUsers({ role, termo: debouncedTermo, page: nextPage, limit });
      setHasMore(response.hasMore);
      setPage(response.page);
      setUsers(response.items);
    } finally {
      setLoading(false);
    }
    },
    [debouncedTermo, limit, role]
  );

  // Busca usuários ao abrir a tela ou mudar o papel
  useEffect(() => {
    loadUsers(1);
  }, [loadUsers, role]);

  // Busca usuários ao alterar termo de busca
  useEffect(() => {
    // Ao alterar o termo (após debounce), reinicia na página 1.
    loadUsers(1);
  }, [debouncedTermo, loadUsers]);

  // Recarrega lista ao voltar do formulário
  useFocusEffect(
    useCallback(() => {
      // Ao voltar do formulário (criar/editar), recarrega a página atual
      // respeitando o termo de busca.
      loadUsers(page);
    }, [loadUsers, page])
  );

  // Verifica permissão para gerenciar usuários
  useEffect(() => {
    if (user && user.role !== "professor") {
      Alert.alert("Acesso restrito", "Apenas professores podem gerenciar usuários.");
      navigation.navigate("Posts");
    }
  }, [navigation, user]);

  // Função para excluir usuário
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

  const sortedUsers = useMemo(() => {
    const copy = [...users];
    copy.sort((a, b) =>
      (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR", {
        sensitivity: "base",
        ignorePunctuation: true,
      })
    );
    return copy;
  }, [users]);

  const canGoPrev = page > 1;
  const canGoNext = hasMore;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{role === "professor" ? "Professores" : "Alunos"}</Text>

      <AppInput
        label="Buscar"
        value={termo}
        onChangeText={setTermo}
        placeholder={role === "professor" ? "Buscar por nome ou email" : "Buscar por nome ou RM"}
        leftIconName="search-outline"
        variant="soft"
        density="compact"
      />

      <View style={styles.addButton}>
        <AppButton
          title={role === "professor" ? "Cadastrar professor" : "Cadastrar aluno"}
          onPress={() => navigation.navigate("UserForm", { mode: "create", role })}
        />
      </View>
      <FlatList
        data={sortedUsers}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadUsers(page)} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardMeta}>
              {role === "professor" ? item.email : `RM: ${item.rm ?? ""}`}
            </Text>
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
          <View style={styles.footer}>
            <View style={styles.pagination}>
              {canGoPrev ? (
                <AppButton
                  title="Anterior"
                  variant="secondary"
                  size="sm"
                  onPress={() => loadUsers(page - 1)}
                  disabled={loading}
                />
              ) : (
                <View style={styles.paginationSpacer} />
              )}

              <Text style={styles.paginationText}>Página {page}</Text>

              {canGoNext ? (
                <AppButton
                  title="Próxima"
                  variant="secondary"
                  size="sm"
                  onPress={() => loadUsers(page + 1)}
                  disabled={loading}
                />
              ) : (
                <View style={styles.paginationSpacer} />
              )}
            </View>
          </View>
        }
        contentContainerStyle={[styles.listContent, users.length === 0 && styles.listEmptyContent]}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              {debouncedTermo ? "Nenhum usuário encontrado para a busca." : "Nenhum usuário encontrado."}
            </Text>
          ) : null
        }
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
  addButton: {
    marginBottom: 16,
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
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paginationText: {
    color: colors.muted,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  paginationSpacer: {
    width: 92,
  },
  listContent: {
    paddingVertical: 8,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: colors.muted,
    fontWeight: "600",
  },
});

export default UsersListScreen;
