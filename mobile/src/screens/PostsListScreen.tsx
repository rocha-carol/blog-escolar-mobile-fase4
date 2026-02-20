// Importa bibliotecas para criar a tela e manipular dados
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { fetchPosts } from "../services/posts";
import type { Post } from "../types";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";

// Áreas de conhecimento disponíveis
const AREAS_CONHECIMENTO = [
  "Linguagens",
  "Matemática",
  "Ciências da Natureza",
  "Ciências Humanas",
  "Tecnologias",
];

// Quantidade de posts por página
const POSTS_PER_PAGE = 7;

// Componente principal para listar posts
const PostsListScreen: React.FC = () => {
  // Navegação e estados para posts, busca, área e paginação
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [termo, setTermo] = useState("");
  const [debouncedTermo, setDebouncedTermo] = useState("");
  const [loading, setLoading] = useState(false);
  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Função para obter timestamp do post
  const getTimestamp = (post: Post) => {
    const dateValue = post.AtualizadoEm || post.CriadoEm;
    const timeValue = post.AtualizadoEmHora || post.CriadoEmHora;
    if (!dateValue) return 0;

    // dd/MM/yyyy
    const br = /^\d{2}\/\d{2}\/\d{4}$/;
    if (br.test(dateValue)) {
      const [dd, mm, yyyy] = dateValue.split("/").map((p) => Number(p));
      const date = new Date(yyyy, (mm || 1) - 1, dd || 1);
      if (Number.isNaN(date.getTime())) return 0;

      // Hora opcional no formato "HHhMM" (ex.: 14h05)
      if (timeValue && /^\d{2}h\d{2}$/.test(timeValue)) {
        const [hStr, mStr] = timeValue.split("h");
        const h = Number(hStr);
        const m = Number(mStr);
        date.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
      }

      return date.getTime();
    }

    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  // Função para buscar posts
  const loadPosts = useCallback(async (search?: string, selectedArea?: string | null, pageNumber?: number) => {
    setLoading(true);
    try {
      const response = await fetchPosts({ termo: search, page: pageNumber, limit: POSTS_PER_PAGE });
      const basePosts = (response.items ?? []).slice();
      // Removida a ordenação no frontend para confiar na ordenação do backend
      const filtered = selectedArea ? basePosts.filter((item) => item.areaDoConhecimento === selectedArea) : basePosts;
      setPosts(filtered);
      setHasMore(Boolean(response.hasMore));
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar as postagens. Verifique a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para limpar a busca quando o termo é vazio
  useEffect(() => {
    const trimmed = termo.trim();
    // Se limpou a busca, volta imediatamente para o feed normal
    if (!trimmed) {
      setDebouncedTermo("");
      return;
    }

    const t = setTimeout(() => {
      setDebouncedTermo(trimmed);
    }, 350);
    return () => clearTimeout(t);
  }, [termo]);

  // Efeito para carregar posts com base no termo e área selecionada
  useEffect(() => {
    const area = !debouncedTermo && page > 1 ? null : areaSelecionada;
    loadPosts(debouncedTermo, area, page);
  }, [debouncedTermo, areaSelecionada, page, loadPosts]);

  // Ao voltar da leitura (onde comentários podem ser criados), atualiza o feed para refletir a nova contagem.
  useFocusEffect(
    useCallback(() => {
      // Limpa busca e filtro de área ao focar na aba Início
      setTermo("");
      setAreaSelecionada(null);
      setPage(1);
      loadPosts("", null, 1);
    }, [loadPosts])
  );

  const isSearching = debouncedTermo.length > 0;
  const isFirstPage = !isSearching && page === 1;
  const showSearch = isSearching || page === 1;
  const showAreaFilter = isSearching || page === 1;
  const destaque = isFirstPage ? posts[0] : undefined;
  const resto = isFirstPage ? posts.slice(1) : posts;
  const latestPosts = isFirstPage ? resto.slice(0, 3) : resto;
  const readMorePosts = isFirstPage ? resto.slice(3, 6) : [];

  const getNomeAutor = (post: Post) => {
    if (post.autoria?.trim()) return post.autoria;
    return "Autor desconhecido";
  };

  const getComentariosCount = (post: Post) => {
    const v = post.comentariosCount;
    return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;
  };

  const formatDateBR = (value?: string) => {
    if (!value) return "--";
    // Se já estiver no formato esperado (dd/MM/yyyy), mantém
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("pt-BR");
  };

  const getInfoDataPublicacao = (post: Post) => {
    const criado = post.CriadoEm;
    const atualizado = post.AtualizadoEm;
    const foiAtualizado = Boolean(atualizado) && atualizado !== criado;
    if (foiAtualizado) {
      return { label: "Atualizado em", data: formatDateBR(atualizado) };
    }
    return { label: "Publicado em", data: formatDateBR(criado) };
  };

  const handleSelecionarArea = (area: string) => {
    const novaArea = areaSelecionada === area ? null : area;
    setAreaSelecionada(novaArea);
    setPage(1);
  };

  const handleLimparFiltro = () => {
    setAreaSelecionada(null);
    setPage(1);
  };

  const handleNavigatePost = (postId: string, scrollToComments?: boolean) => {
    navigation.navigate("PostDetails", { postId, scrollToComments: Boolean(scrollToComments) });
  };

  const infoDestaque = useMemo(() => (destaque ? getInfoDataPublicacao(destaque) : null), [destaque]);

  const screenWidth = Dimensions.get("window").width;
  // Um pouco maior para caber melhor Área + Data + Título + Autor sem estourar
  const readMoreCardSize = Math.min(255, Math.max(195, Math.round((screenWidth - 40) * 0.78)));
  const noResults = isSearching && !loading && posts.length === 0;

  return (
    <ScrollView
      style={styles.container}
      stickyHeaderIndices={[0]}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => {
            const area = !debouncedTermo && page > 1 ? null : areaSelecionada;
            return loadPosts(debouncedTermo, area, page);
          }}
        />
      }
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={styles.stickyTop}>
        <Text style={styles.headerTitle}>Entre linhas e ideias</Text>
        {showSearch && (
          <View style={styles.searchSection}>
            <AppInput
              value={termo}
              onChangeText={(text) => {
                setTermo(text);
                if (page !== 1) setPage(1);
              }}
              placeholder="O que está procurando?"
              rightIconName="search-outline"
              variant="soft"
              density="compact"
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        )}
      </View>

      {noResults && <Text style={styles.emptyState}>Resultados não encontrados</Text>}

      {!noResults && isFirstPage && (
        <LinearGradient
          colors={["rgba(124, 77, 190, 0.18)", "rgba(124, 77, 190, 0.06)", colors.white]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featureSection}
        >
          <View style={styles.featureSectionTitle}>
            <Text style={styles.featureHeading}>Destaque do dia</Text>
          </View>

          {destaque ? (
            <Pressable style={styles.featureCard} onPress={() => handleNavigatePost(destaque._id)}>
              <LinearGradient
                colors={["rgba(124, 77, 190, 0.18)", "rgba(124, 77, 190, 0.06)", colors.white]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.featureMedia}
              >
                {destaque.imagem ? (
                  <Image source={{ uri: destaque.imagem }} style={styles.featureImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.featureImage, styles.imagePlaceholder]} />
                )}
              </LinearGradient>

              <View style={styles.featureContent}>
                <View style={styles.cardRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText} numberOfLines={1} ellipsizeMode="tail">
                      {destaque.areaDoConhecimento || "Artigos"}
                    </Text>
                  </View>
                  {infoDestaque && (
                    <Text style={styles.cardMetaInline} numberOfLines={1}>
                      {infoDestaque.label} {infoDestaque.data}
                    </Text>
                  )}
                </View>
                <Text
                  style={styles.featureTitle}
                  numberOfLines={3}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  ellipsizeMode="clip"
                >
                  {destaque.titulo}
                </Text>
                <Text style={styles.featureText} numberOfLines={4}>
                  {destaque.conteudo}
                </Text>
                <View style={styles.cardFooterRow}>
                  <Pressable
                    onPress={() => handleNavigatePost(destaque._id, true)}
                    style={styles.commentsMeta}
                    hitSlop={8}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color={colors.muted} />
                    <Text style={styles.commentsText}>{getComentariosCount(destaque)}</Text>
                  </Pressable>
                  <Text style={styles.cardAuthor}>Publicado por: {getNomeAutor(destaque)}</Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <View style={styles.featureSectionTitle}>
              <Text style={styles.emptyState}>Nenhuma postagem disponível no momento.</Text>
            </View>
          )}
        </LinearGradient>
      )}

      {showAreaFilter && (
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

          <View style={styles.sectionDivider} />
        </View>
      )}

      {!noResults && (
        <View style={styles.latestSection}>
          <Text style={styles.sectionTitle}>
            {isSearching ? "Resultados" : isFirstPage ? "Últimas Postagens" : "Mais conteúdos"}
          </Text>
          {latestPosts.map((post) => (
            <Pressable
              key={post._id}
              style={[styles.latestCard, !isSearching && styles.latestCardNarrow]}
              onPress={() => handleNavigatePost(post._id)}
            >
              {post.imagem ? (
                <Image
                  source={{ uri: post.imagem }}
                  style={[styles.latestImage, isFirstPage && !isSearching && styles.latestImageNarrowTall]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.latestImage,
                    isFirstPage && !isSearching && styles.latestImageNarrowTall,
                    styles.imagePlaceholder,
                  ]}
                />
              )}
              <View
                style={[
                  styles.latestContent,
                  isFirstPage && !isSearching && styles.latestContentNarrow,
                ]}
              >
                <View style={styles.latestBody}>
                  <View style={[styles.cardRow, styles.cardRowWrap]}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText} numberOfLines={1} ellipsizeMode="tail">
                        {post.areaDoConhecimento || "Artigos"}
                      </Text>
                    </View>
                    <Text style={[styles.cardMetaInline, styles.cardMetaInlineFull]}>
                      {getInfoDataPublicacao(post).label} {getInfoDataPublicacao(post).data}
                    </Text>
                  </View>
                  <Text
                    style={styles.latestTitle}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    ellipsizeMode="clip"
                  >
                    {post.titulo}
                  </Text>
                  <Text style={styles.latestText} numberOfLines={3}>
                    {post.conteudo}
                  </Text>
                </View>

                <View style={[styles.cardFooterRow, styles.latestFooterRow]}>
                  <Pressable
                    onPress={() => handleNavigatePost(post._id, true)}
                    style={styles.commentsMeta}
                    hitSlop={8}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color={colors.muted} />
                    <Text style={styles.commentsText}>{getComentariosCount(post)}</Text>
                  </Pressable>
                  <Text style={styles.cardAuthor} numberOfLines={1}>
                    Publicado por: {getNomeAutor(post)}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {!noResults && isFirstPage && (
        <View style={styles.readMoreSection}>
          <Text style={styles.sectionTitle}>Você também pode ler...</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.readMoreRow}
          >
            {readMorePosts.map((post) => (
            <Pressable
              key={post._id}
              style={[styles.readMoreCard, { width: readMoreCardSize }]}
              onPress={() => handleNavigatePost(post._id)}
            >
              <View style={styles.readMoreMedia}>
                {post.imagem ? (
                  <Image source={{ uri: post.imagem }} style={styles.readMoreImage} resizeMode="cover" />
                ) : (
                  <View style={styles.readMorePlaceholder} />
                )}
              </View>

              <View style={styles.readMoreContent}>
                <View style={[styles.cardRow, styles.cardRowWrap]}>
                  <View style={[styles.badge, styles.badgeReadMoreInline]}>
                    <Text style={styles.badgeTextSmall}>
                      {post.areaDoConhecimento || "Artigos"}
                    </Text>
                  </View>
                  <Text style={styles.cardMetaInlineReadMore}>
                    {getInfoDataPublicacao(post).label} {getInfoDataPublicacao(post).data}
                  </Text>
                </View>

                <View style={styles.readMoreTitleWrap}>
                  <Text
                    style={styles.readMoreTitle}
                    numberOfLines={3}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    ellipsizeMode="clip"
                  >
                    {post.titulo}
                  </Text>
                </View>

                <Text style={styles.cardAuthor} numberOfLines={1}>
                  Publicado por: {getNomeAutor(post)}
                </Text>

                <Pressable
                  onPress={() => handleNavigatePost(post._id, true)}
                  style={styles.commentsMetaReadMore}
                  hitSlop={8}
                >
                  <Ionicons name="chatbubble-outline" size={13} color={colors.muted} />
                  <Text style={styles.commentsText}>{getComentariosCount(post)}</Text>
                </Pressable>
              </View>
            </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {!noResults && !isSearching && (
        <View style={styles.pagination}>
          {page > 1 ? (
            <AppButton
              title="Anterior"
              onPress={() => {
                const newPage = Math.max(page - 1, 1);
                setPage(newPage);
              }}
              variant="secondary"
              size="sm"
            />
          ) : (
            <View style={styles.paginationSpacer} />
          )}
          <Text style={styles.pageIndicator}>Página {page}</Text>
          <AppButton
            title="Próxima"
            onPress={() => {
              const newPage = page + 1;
              setPage(newPage);
            }}
            disabled={!hasMore}
            variant="secondary"
            size="sm"
          />
        </View>
      )}

      {!noResults && !isSearching && !hasMore && posts.length > 0 && (
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  stickyTop: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.18)",
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    width: "100%",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 15,
    color: colors.white,
  },
  searchSection: {
    paddingHorizontal: 0,
    paddingTop: 0,
    marginTop: 8,
    marginBottom: 4,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  categoriesList: {
    paddingVertical: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.85,
    marginTop: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  featureSection: {
    paddingTop: 6,
    paddingBottom: 4,
  },
  featureSectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 2,
    alignItems: "center",
  },
  featureHeading: {
    fontSize: 19,
    fontWeight: "700",
    color: "rgba(124, 77, 190, 0.92)",
    textAlign: "center",
    letterSpacing: 0.6,
    fontFamily: "Fredoka_700Bold",
    textShadowColor: "rgba(255, 255, 255, 0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 0,
    borderWidth: 0,
    marginHorizontal: 12,
    marginBottom: 2,
    shadowColor: colors.secondary,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  featureMedia: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 6,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  featureImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginTop: 6,
  },
  featureContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badge: {
    backgroundColor: colors.secondary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    maxWidth: "55%",
  },
  badgeCompact: {
    // Reserva espaço para até 2 linhas (mantém a linha da data alinhada entre os cards compactos)
    minHeight: 30,
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
  },
  badgeTextSmall: {
    color: colors.white,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "700",
  },
  cardMetaSmall: {
    color: colors.muted,
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "600",
  },
  cardMetaInline: {
    color: colors.muted,
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "600",
    flexShrink: 0,
    maxWidth: "45%",
    marginLeft: 8,
    textAlign: "right",
  },
  cardMetaInlineFull: {
    flexShrink: 1,
    maxWidth: "100%",
  },
  cardMetaInlineReadMore: {
    color: colors.muted,
    fontSize: 9,
    fontStyle: "italic",
    fontWeight: "600",
    flexShrink: 1,
    marginLeft: 8,
    textAlign: "right",
  },
  cardMetaCompact: {
    color: colors.muted,
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "600",
    textAlign: "right",
    marginTop: 2,
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
    textAlign: "left",
  },
  featureText: {
    color: colors.text,
    marginBottom: 10,
    lineHeight: 20,
    textAlign: "justify",
  },
  cardAuthor: {
    color: colors.muted,
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "right",
    alignSelf: "flex-end",
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  commentsMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentsMetaReadMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  commentsText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  latestSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  latestCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  latestCardNarrow: {
    width: "96%",
    alignSelf: "center",
  },
  latestContent: {
    width: "100%",
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 10,
    minHeight: 150,
  },
  latestContentNarrow: {
    width: "91%",
    alignSelf: "center",
  },
  latestBody: {
    width: "100%",
  },
  latestFooterRow: {
    marginTop: 10,
  },
  latestImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  latestImageNarrowTall: {
    width: "91%",
    height: 165,
    alignSelf: "center",
    marginBottom: 8,
  },
  imagePlaceholder: {
    backgroundColor: "rgba(124, 77, 190, 0.08)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  latestTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    textAlign: "left",
  },
  latestText: {
    color: colors.text,
    textAlign: "justify",
    marginBottom: 4,
    lineHeight: 18,
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
    textAlign: "left",
  },
  readMoreSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  readMoreRow: {
    paddingRight: 20,
    gap: 12,
  },
  readMoreCard: {
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 7,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readMoreMedia: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  readMoreImage: {
    width: "100%",
    height: "100%",
  },
  readMorePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background,
  },
  readMoreContent: {
    flex: 1,
    paddingTop: 8,
  },
  readMoreTitleWrap: {
    flex: 1,
    justifyContent: "center",
  },
  readMoreTitle: {
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
    marginBottom: 6,
    textAlign: "left",
  },
  badgeReadMoreInline: {
    // Menor para caber com a data na mesma linha nos cards quadrados
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 10,
    flexShrink: 1,
    maxWidth: "60%",
  },
  cardRowWrap: {
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  paginationSpacer: {
    width: 110,
  },
  pageIndicator: {
    fontWeight: "700",
    color: colors.secondary,
  },
  endMessage: {
    textAlign: "center",
    color: colors.muted,
    fontWeight: "600",
    paddingVertical: 8,
  },
  emptyState: {
    color: colors.muted,
    textAlign: "center",
    paddingVertical: 8,
  },
});

export default PostsListScreen;
