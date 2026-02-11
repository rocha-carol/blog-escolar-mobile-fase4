import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
// Importa componentes reutilizáveis
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
// Importa cores do tema
import colors from "../theme/colors";
// Importa funções para buscar post e comentários
import { fetchPost } from "../services/posts";
import { createComment, fetchComments } from "../services/comments";
import type { Post } from "../types";

// Componente principal da tela de detalhes do post
const PostDetailsScreen: React.FC<{ route: any }> = ({ route }) => {
  // Extrai o id do post e se deve rolar para comentários
  const { postId } = route.params;
  const scrollToComments = Boolean(route?.params?.scrollToComments);
  // Estados para armazenar dados do post, carregamento, comentários e campos do formulário
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; author: string; message: string; createdAt: string }>>(
    []
  );
  const [commentsAvailable, setCommentsAvailable] = useState(true);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [didAutoScroll, setDidAutoScroll] = useState(false);
  const [commentsLayoutY, setCommentsLayoutY] = useState<number | null>(null);
  // Referência para o ScrollView
  const scrollRef = useRef<ScrollView | null>(null);

  // Função para quebrar palavras longas e evitar problemas de layout
  const softWrapLongTokens = (text: string, maxTokenLen = 28, chunkSize = 18) => {
    const withSpaces = text.split(/(\s+)/);
    return withSpaces
      .map((part) => {
        if (!part || /^\s+$/.test(part)) return part;
        if (part.length <= maxTokenLen) return part;
        return part.replace(new RegExp(`(.{${chunkSize}})`, "g"), "$1\u200B");
      })
      .join("");
  };

  // Função para mostrar nome do autor ou "Autor desconhecido"
  const getNomeAutor = (item: Post) => {
    if (item.autoria?.trim()) return item.autoria;
    return "Autor desconhecido";
  };

  // Função para formatar datas no padrão brasileiro
  const formatDateBR = (value?: string) => {
    if (!value) return "--";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("pt-BR");
  };

  // Memoiza informações de datas do post
  const datasInfo = useMemo(() => {
    if (!post) return null;
    const criado = post.CriadoEm;
    const atualizado = post.AtualizadoEm;
    const foiAtualizado = Boolean(atualizado) && atualizado !== criado;
    return {
      criado: formatDateBR(criado),
      atualizado: formatDateBR(atualizado),
      foiAtualizado,
    };
  }, [post]);

  // Memoiza conteúdo formatado do post
  const conteudoFormatado = useMemo(() => {
    if (!post?.conteudo) return "";
    return softWrapLongTokens(post.conteudo);
  }, [post?.conteudo]);

  // Memoiza os parágrafos do post para exibir separados
  const paragrafos = useMemo(() => {
    // Mantém quebras de linha e evita um Text gigante (ajuda em alguns casos de clipping no Android)
    const raw = conteudoFormatado;
    if (!raw) return [] as string[];
    return raw
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [conteudoFormatado]);

  // Busca os dados do post ao abrir a tela
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

  // Função para buscar comentários do post
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const list = await fetchComments(postId);
      setComments(list.map((c) => ({ id: c.id, author: c.author, message: c.message, createdAt: c.createdAt })));
      setCommentsAvailable(true);
    } catch (e) {
      // Comentários são opcionais; se a API não estiver disponível, mantém só a leitura do post.
      setCommentsAvailable(false);
    } finally {
      setLoadingComments(false);
    }
  };

  // Busca comentários ao abrir a tela ou mudar o post
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Rola automaticamente para a seção de comentários se solicitado
  useEffect(() => {
    if (!scrollToComments) return;
    if (didAutoScroll) return;
    if (commentsLayoutY === null) return;

    const y = Math.max(0, commentsLayoutY - 8);
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
      setDidAutoScroll(true);
    }, 150);
    return () => clearTimeout(t);
  }, [commentsLayoutY, didAutoScroll, scrollToComments]);

  // Função para adicionar novo comentário
  const handleAddComment = async () => {
    if (!commentsAvailable) return;
    const texto = commentMessage.trim();
    const autor = commentAuthor.trim();
    if (!texto) return;

    try {
      await createComment(postId, { autor: autor || undefined, texto });
      setCommentMessage("");
      await loadComments();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível enviar seu comentário. Tente novamente.");
    }
  };

  // Exibe indicador de carregamento enquanto busca dados
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Exibe mensagem se o post não for encontrado
  if (!post) {
    return (
      <View style={styles.loading}>
        <Text>Post não encontrado.</Text>
      </View>
    );
  }

  // Renderiza a tela de detalhes do post
  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Seção principal do post */}
      <View style={styles.heroSection}>
        <View style={styles.postContainer}>
          {/* Cabeçalho do post */}
          <View style={styles.postHeader}>
            <Text style={styles.title}>{post.titulo}</Text>
          </View>

          {/* Imagem do post ou placeholder */}
          <View style={styles.postMedia}>
            <View style={styles.postImageWrapper}>
              {post.imagem ? (
                <Image source={{ uri: post.imagem }} style={styles.postImage} resizeMode="cover" />
              ) : (
                <View style={styles.postPlaceholder} />
              )}
            </View>
          </View>

          {/* Metadados do post (área, datas) */}
          <View style={styles.postMeta}>
            <View style={styles.cardRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{post.areaDoConhecimento || "Artigos"}</Text>
              </View>
              {datasInfo && (
                <Text style={styles.cardMetaInline}>
                  {datasInfo.foiAtualizado ? "Atualizado em" : "Publicado em"}{" "}
                  {datasInfo.foiAtualizado ? datasInfo.atualizado : datasInfo.criado}
                </Text>
              )}
            </View>
          </View>

          {/* Conteúdo do post */}
          <View style={styles.postContent}>
            <View style={styles.contentWrap}>
              {paragrafos.length > 0 ? (
                paragrafos.map((p, idx) => (
                  <Text key={`${idx}-${p.slice(0, 12)}`} style={styles.paragraph} selectable>
                    {p}
                  </Text>
                ))
              ) : (
                <Text style={styles.paragraph} selectable>
                  {conteudoFormatado}
                </Text>
              )}
            </View>

            <Text style={styles.cardAuthor}>Publicado por: {getNomeAutor(post)}</Text>
          </View>
        </View>
      </View>

      {/* Seção de comentários */}
      <View
        style={styles.commentsSection}
        onLayout={(e) => {
          setCommentsLayoutY(e.nativeEvent.layout.y);
        }}
      >
        <Text style={styles.sectionTitle}>Comentários {commentsAvailable ? "" : "(opcional)"}</Text>

        {!commentsAvailable ? (
          <Text style={styles.emptyText}>Comentários indisponíveis no momento. Continue a leitura 😊</Text>
        ) : (
          <>
            <AppInput
              value={commentAuthor}
              onChangeText={setCommentAuthor}
              placeholder="Seu nome (opcional)"
              variant="soft"
              density="compact"
              containerStyle={{ marginBottom: 10 }}
            />
            <AppInput
              value={commentMessage}
              onChangeText={setCommentMessage}
              placeholder="Digite seu comentário"
              multiline
              variant="soft"
              density="compact"
              containerStyle={{ marginBottom: 10 }}
            />
            <AppButton
              title={loadingComments ? "Carregando..." : "Enviar comentário"}
              onPress={handleAddComment}
              disabled={!commentMessage.trim()}
            />

            {loadingComments && <Text style={styles.emptyText}>Carregando comentários...</Text>}

            {!loadingComments && comments.length === 0 ? (
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
          </>
        )}
      </View>
    </ScrollView>
  );
};

// Estilos para cada parte da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    paddingTop: 12,
    paddingBottom: 10,
  },
  postContainer: {
    backgroundColor: "transparent",
    borderRadius: 0,
    marginHorizontal: 0,
    borderWidth: 0,
  },
  postHeader: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
  },
  postMedia: {
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 12,
  },
  postMeta: {
    paddingHorizontal: 24,
    paddingBottom: 6,
  },
  postImageWrapper: {
    borderRadius: 14,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
  },
  postPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.background,
  },
  postContent: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    width: "100%",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  badge: {
    backgroundColor: colors.secondary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    maxWidth: "60%",
    flexShrink: 1,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },
  cardMetaInline: {
    color: colors.muted,
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "600",
    flexShrink: 1,
    flexGrow: 1,
    marginLeft: 8,
    textAlign: "right",
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 14,
    color: colors.text,
    textAlign: "left",
  },
  cardAuthor: {
    color: colors.muted,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "right",
    alignSelf: "flex-end",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  contentWrap: {
    marginTop: 10,
    width: "100%",
    alignSelf: "stretch",
  },
  paragraph: {
    fontSize: 16,
    // Mais folga para evitar clipping de letras em alguns Androids (ascendentes/descendentes)
    lineHeight: 30,
    paddingVertical: 1,
    // Evita que o último caractere encoste na borda e seja "clipado" por arredondamento de pixels
    paddingRight: 2,
    color: colors.text,
    // Android (Expo Go/emulador): justify pode gerar clipping visual em alguns trechos.
    textAlign: Platform.OS === "android" ? "left" : "justify",
    width: "100%",
    alignSelf: "stretch",
    flexShrink: 1,
    includeFontPadding: true,
    textAlignVertical: "top",
    ...(Platform.OS === "android"
      ? {
          // Android-only
          textBreakStrategy: "highQuality" as const,
          fontFamily: "sans-serif",
        }
      : null),
  },
  commentsSection: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  emptyText: {
    color: colors.muted,
    marginTop: 12,
  },
  commentCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 0,
    borderWidth: 0,
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

// Exporta o componente para ser usado em outras telas
export default PostDetailsScreen;
