import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { fetchPosts } from "../services/posts";
import type { Post } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const PostsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [termo, setTermo] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPosts = async (search?: string) => {
    setLoading(true);
    try {
      const response = await fetchPosts({ termo: search });
      setPosts(response.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Postagens</Text>
      <AppInput label="Buscar" value={termo} onChangeText={setTermo} placeholder="Palavra-chave" />
      <AppButton title="Pesquisar" onPress={() => loadPosts(termo)} />
      {user?.role === "professor" && (
        <View style={styles.createButton}>
          <AppButton title="Criar nova postagem" onPress={() => navigation.navigate("PostForm", { mode: "create" })} />
        </View>
      )}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadPosts(termo)} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardMeta}>Autor: {item.autoria || "Não informado"}</Text>
            <Text numberOfLines={3} style={styles.cardDescription}>
              {item.conteudo}
            </Text>
            <AppButton title="Ler post" onPress={() => navigation.navigate("PostDetails", { postId: item._id })} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
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
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  createButton: {
    marginVertical: 12,
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
    marginBottom: 8,
  },
  cardDescription: {
    color: colors.text,
    marginBottom: 12,
  },
});

export default PostsListScreen;
