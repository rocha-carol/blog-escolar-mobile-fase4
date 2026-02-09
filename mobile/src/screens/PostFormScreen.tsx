import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import colors from "../theme/colors";
import { createPost, fetchPost, updatePost } from "../services/posts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";

const PostFormScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { mode, postId, origin } = route.params || { mode: "create" };
  const { user } = useAuth();
  const toast = useToast();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [autoria, setAutoria] = useState("");
  const [area, setArea] = useState("Linguagens");
  const [loading, setLoading] = useState(false);

  const initialSnapshotRef = useRef<{
    titulo: string;
    conteudo: string;
    autoria: string;
  } | null>(null);

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
        autoria: user?.nome || "",
      };
    }
  }, [mode, user?.nome]);

  useEffect(() => {
    if (user && user.role !== "professor") {
      Alert.alert("Acesso restrito", "Apenas professores podem criar ou editar postagens.");
      navigation.navigate("Main");
      return;
    }

    if (mode === "edit" && postId) {
      initialSnapshotRef.current = null;
      fetchPost(postId).then((post) => {
        setTitulo(post.titulo || "");
        setConteudo(post.conteudo || "");
        setAutoria(post.autoria || user?.nome || "");
        setArea(post.areaDoConhecimento || "Linguagens");

        initialSnapshotRef.current = {
          titulo: post.titulo || "",
          conteudo: post.conteudo || "",
          autoria: post.autoria || user?.nome || "",
        };
      });
    }
  }, [mode, navigation, postId, user]);

  const hasUnsavedChanges = useMemo(() => {
    const snap = initialSnapshotRef.current;
    if (!snap) return false;

    return titulo !== snap.titulo || conteudo !== snap.conteudo || autoria !== snap.autoria;
  }, [autoria, conteudo, titulo]);

  useUnsavedChangesGuard({
    navigation,
    enabled: true,
    hasUnsavedChanges,
    allowExitWithoutPromptRef,
  });

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

    if (!titulo.trim()) {
      Alert.alert("Atenção", "Preencha o título.");
      return;
    }

    if (!conteudo.trim()) {
      Alert.alert("Atenção", "Preencha o conteúdo.");
      return;
    }

    if (!autoria.trim()) {
      Alert.alert("Atenção", "Preencha o autor.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        autoria: autoria.trim(),
        areaDoConhecimento: area,
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
      Alert.alert("Erro", "Não foi possível enviar a postagem ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>{mode === "edit" ? "Editar Postagem" : "Criar Postagem"}</Text>
      <View style={styles.card}>
        <AppInput label="Título *" value={titulo} onChangeText={setTitulo} placeholder="Digite o título" />
        <AppInput
          label="Conteúdo *"
          value={conteudo}
          onChangeText={setConteudo}
          multiline
          placeholder="Escreva o conteúdo da postagem"
        />
        <AppInput label="Autor *" value={autoria} onChangeText={setAutoria} placeholder="Nome do autor" />

        <AppButton
          title={loading ? "Enviando..." : "Enviar Postagem"}
          onPress={handleSubmit}
          disabled={loading}
        />
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
});

export default PostFormScreen;
