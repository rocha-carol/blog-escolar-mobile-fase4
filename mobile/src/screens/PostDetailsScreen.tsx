import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { fetchPost } from "../services/posts";
import type { Post } from "../types";

type Comment = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
};

const PostDetailsScreen: React.FC<{ route: any }> = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentMessage, setCommentMessage] = useState("");

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

  const handleAddComment = () => {
    if (!commentMessage.trim()) return;
    const newComment: Comment = {
      id: `${Date.now()}`,
      author: commentAuthor.trim() || "Anônimo",
      message: commentMessage.trim(),
      createdAt: new Date().toLocaleString("pt-BR"),
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentMessage("");
  };

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

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comentários</Text>
        <AppInput label="Nome" value={commentAuthor} onChangeText={setCommentAuthor} placeholder="Seu nome" />
        <AppInput
          label="Mensagem"
          value={commentMessage}
          onChangeText={setCommentMessage}
          placeholder="Digite seu comentário"
          multiline
        />
        <AppButton title="Enviar comentário" onPress={handleAddComment} />
        {comments.length === 0 ? (
          <Text style={styles.emptyText}>Ainda não há comentários.</Text>
        ) : (
          comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentDate}>{comment.createdAt}</Text>
              <Text style={styles.commentMessage}>{comment.message}</Text>
            </View>
          ))
        )}
      </View>
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
  commentsSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.text,
  },
  emptyText: {
    color: colors.muted,
    marginTop: 12,
  },
  commentCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  commentAuthor: {
    fontWeight: "700",
    color: colors.text,
  },
  commentDate: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  commentMessage: {
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
