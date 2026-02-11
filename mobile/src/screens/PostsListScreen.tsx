import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { fetchPosts } from "../services/posts";
import type { Post } from "../types";

// Componente principal para listar posts
const PostsListScreen: React.FC = () => {
  // Navegação e estados para posts, busca, área e paginação
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPosts = async (keyword?: string) => {
    setLoading(true);
    try {
      const response = await fetchPosts(keyword ? { termo: keyword } : undefined);
      setPosts(response.items ?? []);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadPosts(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const postsFiltrados = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return posts;

    return posts.filter((post) => {
      const titulo = post.titulo?.toLowerCase() ?? "";
      const autor = post.autoria?.toLowerCase() ?? "";
      const conteudo = post.conteudo?.toLowerCase() ?? "";
      return titulo.includes(termo) || autor.includes(termo) || conteudo.includes(termo);
    });
  }, [posts, search]);

  const getDescricao = (conteudo?: string) => {
    const texto = (conteudo ?? "").replace(/\s+/g, " ").trim();
    if (texto.length <= 120) return texto;
    return `${texto.slice(0, 120)}...`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posts</Text>
      <AppInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por palavras-chave"
        rightIconName="search-outline"
        variant="soft"
        density="compact"
      />

      <FlatList
        data={postsFiltrados}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadPosts(search.trim())} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Carregando posts..." : "Nenhum post encontrado."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("PostDetails", { postId: item._id })}>
            <Text style={styles.postTitle}>{item.titulo}</Text>
            <Text style={styles.postAuthor}>Autor: {item.autoria || "Autor desconhecido"}</Text>
            <Text style={styles.postDescription}>{getDescricao(item.conteudo) || "Sem descrição."}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  postAuthor: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 24,
  },
});

export default PostsListScreen;
