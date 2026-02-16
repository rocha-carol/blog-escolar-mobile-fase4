// Importa bibliotecas para criar a tela e manipular dados
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { deletePost, fetchPosts } from "../services/posts";
import type { Post } from "../types";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

// Componente principal para administração de posts
const AdminPostsScreen: React.FC = () => {
  // Navegação, rota e autenticação
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  // Estados para posts, carregamento e busca
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [termo, setTermo] = useState("");
  const lastHandledCreatedTokenRef = useRef<number | null>(null);

  // Função para formatar datas
  const formatDateBR = (value?: string) => {
    if (!value) return "--";
    // Se já estiver no formato esperado (dd/MM/yyyy), mantém
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("pt-BR");
  };

  // Função para converter datas em timestamp
  const toTimestamp = (dateValue?: string, timeValue?: string) => {
    if (!dateValue) return 0;

    // dd/MM/yyyy
    const br = dateValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (br) {
      const dia = Number(br[1]);
      const mes = Number(br[2]);
      const ano = Number(br[3]);
      const d = new Date(ano, mes - 1, dia);
      if (Number.isNaN(d.getTime())) return 0;

      // Hora opcional no formato "HHhMM" (ex.: 14h05)
      if (timeValue && /^\d{2}h\d{2}$/.test(timeValue)) {
        const [hStr, mStr] = timeValue.split("h");
        const h = Number(hStr);
        const m = Number(mStr);
        d.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
      }

      return d.getTime();
    }

    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  // Função para obter informações de publicação
  const getInfoDataPublicacao = (post: Post) => {
    const criado = post.CriadoEm;
    const atualizado = post.AtualizadoEm;
    const foiAtualizado = Boolean(atualizado) && atualizado !== criado;
    if (foiAtualizado) {
      return { label: "Atualizado em", data: formatDateBR(atualizado) };
    }
    return { label: "Publicado em", data: formatDateBR(criado) };
  };

  // Verifica se usuário tem permissão para administrar
  useEffect(() => {
    if (user && user.role !== "professor") {
      Alert.alert("Acesso restrito", "Apenas professores podem administrar postagens.");
      navigation.navigate("Posts");
    }
  }, [navigation, user]);

  // Função para buscar posts
  const loadPosts = useCallback(async (opts?: { merge?: boolean }) => {
    setLoading(true);
    try {
      const autor = user?.nome?.trim();
      const response = await fetchPosts({ autor: autor || undefined, page: 1, limit: 50 });
      const fetched = response.items ?? [];
      if (!opts?.merge) {
        // Mantém a ordem atual (inclui inserção otimista no topo) e atualiza itens vindos do backend.
        setPosts(fetched);
        return;
      }

      // Merge: mantém a ordem atual (inclui inserção otimista no topo) e atualiza itens vindos do backend.
      setPosts((prev) => {
        const prevIds = new Set(prev.map((p) => p._id));
        const fetchedMap = new Map(fetched.map((p) => [p._id, p] as const));

        const merged: Post[] = prev
          .map((p) => fetchedMap.get(p._id) ?? p)
          .filter((p) => Boolean(p?._id));

        for (const p of fetched) {
          if (!prevIds.has(p._id)) merged.push(p);
        }

        return merged;
      });
    } finally {
      setLoading(false);
    }
  }, [user?.nome]);

  // Ao focar na tela (voltar do formulário), injeta o post recém-criado no topo imediatamente.
  useFocusEffect(
    useCallback(() => {
      const token = route?.params?.createdPostToken as number | undefined;
      const createdPost = route?.params?.createdPost as Post | undefined;

      if (token && token !== lastHandledCreatedTokenRef.current && createdPost?._id) {
        lastHandledCreatedTokenRef.current = token;
        setPosts((prev) => {
          const withoutDup = prev.filter((p) => p._id !== createdPost._id);
          return [createdPost, ...withoutDup];
        });

        // Limpa params para evitar reprocessar ao alternar abas.
        navigation.setParams({ createdPost: undefined, createdPostToken: undefined });

        // Faz um refetch em background para garantir consistência,
        // mas sem apagar a inserção otimista caso o backend ainda não reflita o novo post.
        loadPosts({ merge: true });
        return;
      }

      loadPosts();
    }, [loadPosts, navigation, route?.params?.createdPost, route?.params?.createdPostToken])
  );

  const filteredPosts = useMemo(() => {
    const q = termo.trim().toLowerCase();
    const base = !q
      ? posts
      : posts.filter((p) => {
      const titulo = (p.titulo ?? "").toLowerCase();
      const conteudo = (p.conteudo ?? "").toLowerCase();
      const area = (p.areaDoConhecimento ?? "").toLowerCase();
      return titulo.includes(q) || conteudo.includes(q) || area.includes(q);
      });

    // Removida a ordenação no frontend para confiar na ordenação do backend
    return base;
  }, [termo, posts]);

  const handleDelete = (postId: string) => {
    Alert.alert("Excluir", "Deseja remover esta postagem?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deletePost(postId);
          loadPosts();
        },
      },
    ]);
  };

  if (!user || user.role !== "professor") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text>Somente professores podem administrar postagens.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administração de postagens</Text>

      <View style={styles.searchWrap}>
        <AppInput
          value={termo}
          onChangeText={setTermo}
          placeholder="Buscar por título, conteúdo ou área"
          rightIconName="search-outline"
          variant="soft"
          density="compact"
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      <View style={styles.addButton}>
        <AppButton
          title="Criar postagem"
          onPress={() => navigation.navigate("PostForm", { mode: "create", origin: "Admin" })}
        />
      </View>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPosts} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardSummary} numberOfLines={2}>
              {item.conteudo}
            </Text>

            <View style={styles.cardMetaRow}>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {getInfoDataPublicacao(item).label} {getInfoDataPublicacao(item).data}
              </Text>
            </View>

            <View style={styles.actions}>
              <AppButton
                title="Editar"
                onPress={() => navigation.navigate("PostForm", { mode: "edit", postId: item._id })}
              />
              <AppButton title="Excluir" variant="danger" onPress={() => handleDelete(item._id)} />
            </View>
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          filteredPosts.length === 0 && styles.listEmptyContent,
        ]}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              {posts.length === 0
                ? "Você ainda não criou postagens."
                : "Nenhuma postagem encontrada para o termo informado."}
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
  searchWrap: {
    marginBottom: 12,
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
  cardSummary: {
    color: colors.text,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardMeta: {
    color: colors.muted,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
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

export default AdminPostsScreen;
