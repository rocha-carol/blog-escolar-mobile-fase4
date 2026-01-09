import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";
import { fetchPost } from "../services/posts";
import type { Post } from "../types";

const PostDetailsScreen: React.FC<{ route: any }> = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchPost(postId);
        setPost(response);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loading}>
        <Text>Post não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>{post.titulo}</Text>
      <Text style={styles.meta}>Autor: {post.autoria || "Não informado"}</Text>
      <Text style={styles.meta}>Área: {post.areaDoConhecimento || "Geral"}</Text>
      <Text style={styles.content}>{post.conteudo}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.text,
  },
  meta: {
    color: colors.muted,
    marginBottom: 4,
  },
  content: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});

export default PostDetailsScreen;
