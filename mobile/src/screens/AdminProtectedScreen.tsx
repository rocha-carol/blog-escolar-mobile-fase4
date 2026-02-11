// Importa bibliotecas para criar a tela e manipular dados
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AdminPostsScreen from "./AdminPostsScreen";
import colors from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";

// Componente para proteger área de administração
const AdminProtectedScreen: React.FC<any> = (props) => {
  // Navegação e autenticação
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Redireciona se não estiver autenticado
  useEffect(() => {
    // Redirecionamento defensivo quando não existe sessão autenticada.
    if (!user) {
      navigation.navigate("Posts");
      return;
    }

    if (user.role !== "professor") {
      navigation.navigate("Posts");
    }
  }, [navigation, user]);

  if (!user || user.role !== "professor") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text style={styles.text}>Apenas professores podem acessar o gerenciamento de posts.</Text>
      </View>
    );
  }

  // Renderiza tela de administração de posts
  return <AdminPostsScreen {...props} />;
};

// Estilos para cada parte da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  text: {
    color: colors.muted,
    textAlign: "center",
  },
});

// Exporta o componente para ser usado em outras telas
export default AdminProtectedScreen;
