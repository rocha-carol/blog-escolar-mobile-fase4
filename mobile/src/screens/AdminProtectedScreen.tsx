import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AdminPostsScreen from "./AdminPostsScreen";
import colors from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";

const AdminProtectedScreen: React.FC<any> = (props) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

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

  return <AdminPostsScreen {...props} />;
};

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

export default AdminProtectedScreen;
