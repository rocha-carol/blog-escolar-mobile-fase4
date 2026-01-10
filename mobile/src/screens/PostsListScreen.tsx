import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { fetchPosts } from "../services/posts";
import type { Post } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const AREAS_CONHECIMENTO = [
  "Linguagens",
  "Matemática",
  "Ciências da Natureza",
  "Ciências Humanas",
  "Tecnologias",
];

const PostsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [termo, setTermo] = useState("");
  const [loading, setLoading] = useState(false);
  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadPosts = useCallback(async (search?: string, selectedArea?: string | null, pageNumber?: number) => {
    setLoading(true);
    try {
      const response = await fetchPosts({ termo: search, page: pageNumber, limit: 11 });
      const basePosts = response.items ?? [];
      const filtered = selectedArea ? basePosts.filter((item) => item.areaDoConhecimento === selectedArea) : basePosts;
      setPosts(filtered);
      setHasMore(Boolean(response.hasMore));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts("", null, 1);
  }, [loadPosts]);

  const destaque = posts[0];
  const ultimas = posts.slice(1);

  const getNomeAutor = (post: Post) => {
    if (post.autoria?.trim()) return post.autoria;
    return "Autor desconhecido";
  };

  const getInfoDataPublicacao = (post: Post) => {
    const criado = post.CriadoEm;
    const atualizado = post.AtualizadoEm;
    const foiAtualizado = Boolean(atualizado) && atualizado !== criado;
    if (foiAtualizado) {
      return { label: "Atualizado em", data: atualizado || "--" };
    }
    return { label: "Publicado em", data: criado || "--" };
  };

  const handlePesquisar = () => {
    setPage(1);
    loadPosts(termo, areaSelecionada, 1);
  };

  const handleSelecionarArea = (area: string) => {
    const novaArea = areaSelecionada === area ? null : area;
    setAreaSelecionada(novaArea);
    setPage(1);
    loadPosts(termo, novaArea, 1);
  };

  const handleLimparFiltro = () => {
    setAreaSelecionada(null);
    setPage(1);
    loadPosts(termo, null, 1);
  };

  const handleNavigatePost = (postId: string) => {
    navigation.navigate("PostDetails", { postId });
  };

  const infoDestaque = useMemo(() => (destaque ? getInfoDataPublicacao(destaque) : null), [destaque]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadPosts(termo, areaSelecionada, page)} />}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blog Escolar</Text>
        <Text style={styles.headerSubtitle}>Entre linhas e ideias</Text>
      </View>

      {user?.role === "professor" && (
        <View style={styles.manageButton}>
          <AppButton
            title="Gerenciamento de postagens"
            onPress={() => navigation.navigate("Admin")}
            variant="primary"
          />
        </View>
      )}

      <View style={styles.searchSection}>
        <AppInput label="Buscar" value={termo} onChangeText={setTermo} placeholder="O que você procura?" />
        <AppButton title="Pesquisar" onPress={handlePesquisar} variant="secondary" />
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Área do Conhecimento</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {AREAS_CONHECIMENTO.map((area) => (
            <Pressable
              key={area}
              onPress={() => handleSelecionarArea(area)}
              style={[styles.categoryChip, areaSelecionada === area && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryChipText, areaSelecionada === area && styles.categoryChipTextActive]}>
                {area}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {areaSelecionada && (
          <View style={styles.clearFilter}>
            <AppButton title="Limpar filtro" onPress={handleLimparFiltro} variant="danger" />
          </View>
        )}
      </View>

      <View style={styles.featureSection}>
        <Text style={styles.sectionTitle}>Destaque do dia</Text>
        {destaque ? (
          <Pressable style={styles.featureCard} onPress={() => handleNavigatePost(destaque._id)}>
            {destaque.imagem && (
              <Image source={{ uri: destaque.imagem }} style={styles.featureImage} resizeMode="cover" />
            )}
            <View style={styles.cardRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{destaque.areaDoConhecimento || "Artigos"}</Text>
              </View>
              {infoDestaque && (
                <Text style={styles.cardMetaSmall}>
                  {infoDestaque.label} {infoDestaque.data}
                </Text>
              )}
            </View>
            <Text style={styles.featureTitle}>{destaque.titulo}</Text>
            <Text style={styles.featureText} numberOfLines={4}>
              {destaque.conteudo}
            </Text>
            <Text style={styles.cardAuthor}>Publicado por: {getNomeAutor(destaque)}</Text>
          </Pressable>
        ) : (
          <Text style={styles.emptyState}>Nenhuma postagem disponível no momento.</Text>
        )}
      </View>

      <View style={styles.latestSection}>
        <Text style={styles.sectionTitle}>Últimas Postagens</Text>
        {ultimas.slice(0, 2).map((post) => (
          <Pressable key={post._id} style={styles.latestCard} onPress={() => handleNavigatePost(post._id)}>
            {post.imagem && <Image source={{ uri: post.imagem }} style={styles.latestImage} resizeMode="cover" />}
            <View style={styles.cardRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{post.areaDoConhecimento || "Artigos"}</Text>
              </View>
              <Text style={styles.cardMetaSmall}>
                {getInfoDataPublicacao(post).label} {getInfoDataPublicacao(post).data}
              </Text>
            </View>
            <Text style={styles.latestTitle}>{post.titulo}</Text>
            <Text style={styles.latestText} numberOfLines={3}>
              {post.conteudo}
            </Text>
            <Text style={styles.cardAuthor}>Publicado por: {getNomeAutor(post)}</Text>
          </Pressable>
        ))}

        {ultimas.slice(2, 5).map((post) => (
          <Pressable key={post._id} style={styles.compactCard} onPress={() => handleNavigatePost(post._id)}>
            {post.imagem && <Image source={{ uri: post.imagem }} style={styles.compactImage} resizeMode="cover" />}
            <View style={styles.compactContent}>
              <View style={styles.cardRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{post.areaDoConhecimento || "Artigos"}</Text>
                </View>
                <Text style={styles.cardMetaSmall}>
                  {getInfoDataPublicacao(post).label} {getInfoDataPublicacao(post).data}
                </Text>
              </View>
              <Text style={styles.compactTitle} numberOfLines={2}>
                {post.titulo}
              </Text>
              <Text style={styles.cardAuthor}>Publicado por: {getNomeAutor(post)}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.readMoreSection}>
        <Text style={styles.sectionTitle}>Você também pode ler...</Text>
        {ultimas.slice(5).map((post) => (
          <Pressable key={post._id} style={styles.readMoreCard} onPress={() => handleNavigatePost(post._id)}>
            {post.imagem ? (
              <Image source={{ uri: post.imagem }} style={styles.readMoreImage} resizeMode="cover" />
            ) : (
              <View style={styles.readMorePlaceholder} />
            )}
            <View style={styles.readMoreContent}>
              <View style={styles.cardRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{post.areaDoConhecimento || "Artigos"}</Text>
                </View>
                <Text style={styles.cardMetaSmall}>
                  {getInfoDataPublicacao(post).label} {getInfoDataPublicacao(post).data}
                </Text>
              </View>
              <Text style={styles.readMoreTitle} numberOfLines={2}>
                {post.titulo}
              </Text>
              <Text style={styles.cardAuthor}>Publicado por: {getNomeAutor(post)}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.pagination}>
        <AppButton
          title="Anterior"
          onPress={() => {
            const newPage = Math.max(page - 1, 1);
            setPage(newPage);
            loadPosts(termo, areaSelecionada, newPage);
          }}
          disabled={page === 1}
          variant="secondary"
        />
        <Text style={styles.pageIndicator}>Página {page}</Text>
        <AppButton
          title="Próxima"
          onPress={() => {
            const newPage = page + 1;
            setPage(newPage);
            loadPosts(termo, areaSelecionada, newPage);
          }}
          disabled={!hasMore}
          variant="secondary"
        />
      </View>

      {!hasMore && posts.length > 0 && (
        <Text style={styles.endMessage}>Você chegou ao fim dos conteúdos.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.white,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 18,
    color: colors.white,
  },
  manageButton: {
    paddingHorizontal: 20,
    marginTop: -18,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  categoriesList: {
    paddingVertical: 12,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: colors.secondary,
  },
  categoryChipText: {
    color: colors.secondary,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  clearFilter: {
    alignSelf: "flex-start",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  featureSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6ddf5",
    shadowColor: "#7c4dbe",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
  },
  featureImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.secondary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  cardMetaSmall: {
    color: colors.muted,
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "600",
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  featureText: {
    color: colors.text,
    marginBottom: 10,
    lineHeight: 20,
    textAlign: "justify",
  },
  cardAuthor: {
    color: colors.muted,
    fontSize: 12,
  },
  latestSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  latestCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  latestImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  latestTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  latestText: {
    color: colors.text,
    textAlign: "justify",
    marginBottom: 8,
  },
  compactCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
  },
  compactTitle: {
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  readMoreSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  readMoreCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  readMoreImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  readMorePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  readMoreContent: {
    flex: 1,
    marginLeft: 12,
  },
  readMoreTitle: {
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
    marginBottom: 6,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  pageIndicator: {
    fontWeight: "700",
    color: colors.secondary,
  },
  endMessage: {
    textAlign: "center",
    color: colors.muted,
    fontWeight: "600",
    paddingVertical: 12,
  },
  emptyState: {
    color: colors.muted,
    textAlign: "center",
    paddingVertical: 12,
  },
});

export default PostsListScreen;
