import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

const StudentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== "aluno") {
      navigation.navigate("Posts");
    }
  }, [navigation, user]);

  if (!user || user.role !== "aluno") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text style={styles.text}>Entre como aluno para acessar esta área.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Área do Aluno</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{user.nome}</Text>
        <Text style={styles.cardMeta}>{user.rm ? `RM: ${user.rm}` : "RM não informado"}</Text>
        <Text style={styles.text}>
          Aqui você pode acompanhar conteúdos e novidades. Em breve, teremos mais recursos para alunos.
        </Text>
      </View>
    </View>
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  cardMeta: {
    color: colors.muted,
    marginBottom: 12,
  },
  text: {
    color: colors.text,
    lineHeight: 20,
  },
});

export default StudentScreen;
