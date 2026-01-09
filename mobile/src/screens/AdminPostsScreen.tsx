import React, { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import colors from "../theme/colors";
import { deletePost, fetchPosts } from "../services/posts";
import type { Post } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const AdminPostsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "professor") {
      Alert.alert("Acesso restrito", "Apenas professores podem administrar postagens.");
      navigation.navigate("Posts");
    }
  }, [navigation, user]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetchPosts();
      setPosts(response.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

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
      <AppButton title="Criar postagem" onPress={() => navigation.navigate("PostForm", { mode: "create" })} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPosts} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardMeta}>Autor: {item.autoria || "Não informado"}</Text>
            <View style={styles.actions}>
              <AppButton
                title="Editar"
                onPress={() => navigation.navigate("PostForm", { mode: "edit", postId: item._id })}
              />
              <AppButton title="Excluir" variant="danger" onPress={() => handleDelete(item._id)} />
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

export default AdminPostsScreen;
