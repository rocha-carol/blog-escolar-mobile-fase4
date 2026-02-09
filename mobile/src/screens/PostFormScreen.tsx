import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { createPost, fetchPost, type UploadFile, updatePost } from "../services/posts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";

const AREA_OPTIONS = ["Linguagens", "Matemática", "Ciências Humanas", "Ciências da Natureza", "Tecnologia"];

const PostFormScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { mode, postId, origin } = route.params || { mode: "create" };
  const { user } = useAuth();
  const toast = useToast();

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [autoria, setAutoria] = useState("");
  const [area, setArea] = useState(AREA_OPTIONS[0]);
  const [imagem, setImagem] = useState<UploadFile | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingPostData, setLoadingPostData] = useState(false);
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  const initialSnapshotRef = useRef<{ titulo: string; conteudo: string; autoria: string; area: string; imagem: string | null } | null>(null);
  const allowExitWithoutPromptRef = useRef(false);

  useEffect(() => {
    if (user?.nome && mode !== "edit") {
      setAutoria(user.nome);
    }
  }, [mode, user?.nome]);

  useEffect(() => {
    const loadPost = async () => {
      if (!user || user.role !== "professor") {
        Alert.alert("Acesso restrito", "Apenas professores podem criar ou editar postagens.");
        navigation.navigate("Main");
        return;
      }

      if (mode !== "edit" || !postId) {
        initialSnapshotRef.current = {
          titulo: "",
          conteudo: "",
          autoria: user?.nome || "",
          area: AREA_OPTIONS[0],
          imagem: null,
        };
        return;
      }

      setLoadingPostData(true);
      try {
        const post = await fetchPost(postId);
        setTitulo(post.titulo || "");
        setConteudo(post.conteudo || "");
        setAutoria(post.autoria || user?.nome || "");
        setArea(post.areaDoConhecimento || AREA_OPTIONS[0]);
        setPreviewUri(post.imagem || null);

        initialSnapshotRef.current = {
          titulo: post.titulo || "",
          conteudo: post.conteudo || "",
          autoria: post.autoria || user?.nome || "",
          area: post.areaDoConhecimento || AREA_OPTIONS[0],
          imagem: post.imagem || null,
        };
      } catch {
        Alert.alert("Erro", "Não foi possível carregar a postagem para edição.");
      } finally {
        setLoadingPostData(false);
      }
    };

    void loadPost();
  }, [mode, navigation, postId, user]);

  const hasUnsavedChanges = useMemo(() => {
    const snap = initialSnapshotRef.current;
    if (!snap) return false;

    return (
      titulo !== snap.titulo ||
      conteudo !== snap.conteudo ||
      autoria !== snap.autoria ||
      area !== snap.area ||
      previewUri !== snap.imagem
    );
  }, [area, autoria, conteudo, previewUri, titulo]);

  useUnsavedChangesGuard({
    navigation,
    enabled: true,
    hasUnsavedChanges,
    allowExitWithoutPromptRef,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 9],
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
    const type = ext === "png" ? "image/png" : "image/jpeg";

    setPreviewUri(asset.uri);
    setImagem({
      uri: asset.uri,
      name: `post-image.${ext}`,
      type,
    });
  };

  const handleSubmit = async () => {
    if (!user || user.role !== "professor") return;
    if (!titulo.trim() || !conteudo.trim() || !autoria.trim()) {
      Alert.alert("Atenção", "Preencha título, conteúdo e autor.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        autoria: autoria.trim(),
        areaDoConhecimento: area,
        imagem,
      };

      if (mode === "edit" && postId) {
        await updatePost(postId, payload);
        toast.show("Post atualizado com sucesso.", { variant: "success" });
      } else {
        const created = await createPost(payload);
        toast.show("Post criado com sucesso.", { variant: "success" });

        if (origin === "Admin") {
          allowExitWithoutPromptRef.current = true;
          navigation.navigate("Main", {
            screen: "Admin",
            params: {
              createdPost: created,
              createdPostToken: Date.now(),
            },
          });
          return;
        }
      }

      allowExitWithoutPromptRef.current = true;
      navigation.goBack();
    } catch {
      Alert.alert("Erro", "Não foi possível enviar a postagem ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "professor") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text>Somente professores podem criar ou editar postagens.</Text>
      </ScrollView>
    );
  }

  if (mode === "edit" && loadingPostData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando dados da postagem...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>{mode === "edit" ? "Editar Postagem" : "Criar Postagem"}</Text>
      <View style={styles.card}>
        <AppInput label="Título *" value={titulo} onChangeText={setTitulo} placeholder="Digite o título" />
        <AppInput label="Conteúdo *" value={conteudo} onChangeText={setConteudo} multiline placeholder="Escreva o conteúdo" />
        <AppInput label="Autor *" value={autoria} onChangeText={setAutoria} placeholder="Nome do autor" />

        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>Área do conhecimento</Text>
          <Pressable style={styles.dropdownContainer} onPress={() => setAreaPickerOpen(true)}>
            <Text style={styles.dropdownValue}>{area}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.imageSection}>
          <View style={styles.imageRow}>
            <Text style={styles.dropdownLabel}>Imagem de capa (opcional)</Text>
            <AppButton title="Escolher imagem" size="sm" variant="secondary" onPress={pickImage} disabled={loading} />
          </View>

          {previewUri && (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: previewUri }} style={styles.imagePreview} resizeMode="cover" />
              <View style={[styles.imageRow, styles.imageRowBelowPreview]}>
                <View />
                <Pressable
                  style={styles.clearImageBtn}
                  onPress={() => {
                    setImagem(null);
                    setPreviewUri(null);
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.muted} />
                  <Text style={styles.clearImageText}>Remover imagem</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <AppButton
          title={loading ? "Salvando..." : mode === "edit" ? "Salvar alterações" : "Salvar"}
          onPress={handleSubmit}
          disabled={loading || loadingPostData}
        />
      </View>

      <Modal visible={areaPickerOpen} transparent animationType="fade" onRequestClose={() => setAreaPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAreaPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => null}>
            <Text style={styles.modalTitle}>Selecione a área</Text>
            {AREA_OPTIONS.map((item) => {
              const active = item === area;
              return (
                <Pressable
                  key={item}
                  style={[styles.modalOption, active && styles.modalOptionActive]}
                  onPress={() => {
                    setArea(item);
                    setAreaPickerOpen(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{item}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={colors.secondary} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: colors.text },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  dropdownWrapper: { marginBottom: 16 },
  dropdownLabel: { color: colors.text, fontWeight: "600", marginBottom: 6 },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownValue: { flex: 1, color: colors.text, fontSize: 15, marginRight: 10 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", padding: 20, justifyContent: "center" },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12 },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  modalOptionActive: { backgroundColor: "rgba(124, 77, 190, 0.10)" },
  modalOptionText: { color: colors.text, fontWeight: "600" },
  modalOptionTextActive: { color: colors.secondary },
  imageSection: { marginBottom: 16 },
  imageRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  imageRowBelowPreview: { marginTop: 12 },
  clearImageBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 6, paddingVertical: 6 },
  clearImageText: { color: colors.muted, fontWeight: "700" },
  imagePreviewWrap: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  imagePreview: { width: "100%", height: 160 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: 10,
    padding: 20,
  },
  loadingText: { color: colors.muted, fontWeight: "600" },
});

export default PostFormScreen;
