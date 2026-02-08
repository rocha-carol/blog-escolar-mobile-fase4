import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { createPost, fetchPost, updatePost } from "../services/posts";
import type { UploadFile } from "../services/posts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";

const AREAS_CONHECIMENTO = [
  "Linguagens",
  "Matemática",
  "Ciências da Natureza",
  "Ciências Humanas",
  "Tecnologias",
];

const PostFormScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { mode, postId, origin } = route.params || { mode: "create" };
  const { user } = useAuth();
  const toast = useToast();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [area, setArea] = useState("");
  const [autoria, setAutoria] = useState("");
  const [imagemPreviewUri, setImagemPreviewUri] = useState("");
  const [imagemFile, setImagemFile] = useState<UploadFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  // Snapshot inicial do formulário para detectar alterações não salvas.
  const initialSnapshotRef = useRef<{
    titulo: string;
    conteudo: string;
    area: string;
    imagemPreviewUri: string;
  } | null>(null);

  // Flag setada após salvar para permitir navegação sem alerta.
  const allowExitWithoutPromptRef = useRef(false);

  useEffect(() => {
    if (user?.nome) {
      setAutoria(user.nome);
    }
  }, [user?.nome]);

  useEffect(() => {
    if (mode !== "edit") {
      initialSnapshotRef.current = {
        titulo: "",
        conteudo: "",
        area: "",
        imagemPreviewUri: "",
      };
    }
  }, [mode]);

  useEffect(() => {
    if (user && user.role !== "professor") {
      Alert.alert("Acesso restrito", "Apenas professores podem criar ou editar postagens.");
      navigation.navigate("Main");
      return;
    }
    if (mode === "edit" && postId) {
      initialSnapshotRef.current = null;
      fetchPost(postId).then((post) => {
        setTitulo(post.titulo);
        setConteudo(post.conteudo);
        setArea(post.areaDoConhecimento || "");
        setImagemPreviewUri(post.imagem || "");
        setImagemFile(null);

        initialSnapshotRef.current = {
          titulo: post.titulo || "",
          conteudo: post.conteudo || "",
          area: post.areaDoConhecimento || "",
          imagemPreviewUri: post.imagem || "",
        };
      });
    }
  }, [mode, navigation, postId, user]);

  const hasUnsavedChanges = useMemo(() => {
    const snap = initialSnapshotRef.current;
    if (!snap) return false;

    const textChanged =
      titulo !== snap.titulo ||
      conteudo !== snap.conteudo ||
      area !== snap.area ||
      imagemPreviewUri !== snap.imagemPreviewUri;

    const pickedNewImage = Boolean(imagemFile);

    return textChanged || pickedNewImage;
  }, [area, conteudo, imagemFile, imagemPreviewUri, titulo]);

  useUnsavedChangesGuard({
    navigation,
    enabled: true,
    hasUnsavedChanges,
    allowExitWithoutPromptRef,
  });

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permissão necessária", "Precisamos de acesso à galeria para selecionar a imagem.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const uri = asset.uri;
      const nameFromUri = uri.split("/").pop() || "imagem.jpg";
      const type = (asset as any)?.mimeType || "image/jpeg";

      setImagemPreviewUri(uri);
      setImagemFile({ uri, name: nameFromUri, type });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
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

  const handleSubmit = async () => {
    if (!user || user.role !== "professor") return;
    const tituloOk = Boolean(titulo?.trim());
    const conteudoOk = Boolean(conteudo?.trim());
    const areaOk = Boolean(area?.trim());
    const imagemOk = Boolean(imagemFile) || Boolean(imagemPreviewUri?.trim());

    if (!imagemOk) {
      Alert.alert("Atenção", "Selecione uma imagem.");
      return;
    }
    if (!tituloOk) {
      Alert.alert("Atenção", "Preencha o título.");
      return;
    }
    if (!conteudoOk) {
      Alert.alert("Atenção", "Preencha o conteúdo.");
      return;
    }
    if (!areaOk) {
      Alert.alert("Atenção", "Selecione a área do conhecimento.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        titulo,
        conteudo,
        autoria: user.nome,
        areaDoConhecimento: area || undefined,
        imagem: imagemFile,
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
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a postagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>{mode === "edit" ? "Editar Postagem" : "Nova Postagem"}</Text>
      <View style={styles.card}>
        <View style={styles.imageSection}>
          <Text style={styles.dropdownLabel}>Imagem *</Text>
          {!!imagemPreviewUri && (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: imagemPreviewUri }} style={styles.imagePreview} resizeMode="cover" />
            </View>
          )}

          <View style={[styles.imageRow, !!imagemPreviewUri && styles.imageRowBelowPreview]}>
            <AppButton
              title={imagemPreviewUri ? "Trocar imagem" : "Selecionar imagem"}
              onPress={handlePickImage}
              variant="secondary"
            />
            {!!imagemPreviewUri && (
              <Pressable
                onPress={() => {
                  setImagemPreviewUri("");
                  setImagemFile(null);
                }}
                style={styles.clearImageBtn}
              >
                <Ionicons name="close-circle-outline" size={20} color={colors.muted} />
                <Text style={styles.clearImageText}>Remover</Text>
              </Pressable>
            )}
          </View>
        </View>

        <AppInput label="Título *" value={titulo} onChangeText={setTitulo} placeholder="Digite o título" />
        <AppInput
          label="Conteúdo *"
          value={conteudo}
          onChangeText={setConteudo}
          multiline
          placeholder="Escreva o conteúdo da postagem"
        />

        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>Área do conhecimento *</Text>
          <Pressable
            onPress={() => setAreaPickerOpen(true)}
            style={styles.dropdownContainer}
            accessibilityRole="button"
            accessibilityLabel="Selecionar área do conhecimento"
          >
            <Text style={[styles.dropdownValue, !area && styles.dropdownPlaceholder]} numberOfLines={1}>
              {area || "Selecione uma área"}
            </Text>
            <Ionicons name="chevron-down-outline" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <AppInput
          label="Autor"
          value={autoria}
          onChangeText={setAutoria}
          placeholder="Nome do autor"
          editable={false}
          inputStyle={{ fontStyle: "italic", color: colors.muted }}
        />
        <AppButton title={loading ? "Salvando..." : "Salvar"} onPress={handleSubmit} disabled={loading} />
      </View>

      <Modal
        visible={areaPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAreaPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setAreaPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => null}>
            <Text style={styles.modalTitle}>Selecione a área</Text>
            {AREAS_CONHECIMENTO.map((opt) => {
              const active = opt === area;
              return (
                <Pressable
                  key={opt}
                  onPress={() => {
                    setArea(opt);
                    setAreaPickerOpen(false);
                  }}
                  style={[styles.modalOption, active && styles.modalOptionActive]}
                >
                  <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                    {opt}
                  </Text>
                  {active && <Ionicons name="checkmark-outline" size={18} color={colors.secondary} />}
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
  dropdownWrapper: {
    marginBottom: 16,
  },
  dropdownLabel: {
    color: colors.text,
    fontWeight: "600",
    marginBottom: 6,
  },
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
  dropdownValue: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    marginRight: 10,
  },
  dropdownPlaceholder: {
    color: colors.muted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  modalOptionActive: {
    backgroundColor: "rgba(124, 77, 190, 0.10)",
  },
  modalOptionText: {
    color: colors.text,
    fontWeight: "600",
  },
  modalOptionTextActive: {
    color: colors.secondary,
  },
  imageSection: {
    marginBottom: 16,
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  imageRowBelowPreview: {
    marginTop: 12,
  },
  clearImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  clearImageText: {
    color: colors.muted,
    fontWeight: "700",
  },
  imagePreviewWrap: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  imagePreview: {
    width: "100%",
    height: 160,
  },
});

export default PostFormScreen;
