import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import HeaderLogoutButton from "../components/HeaderLogoutButton";
import LoginScreen from "../screens/LoginScreen";
import PostsListScreen from "../screens/PostsListScreen";
import PostDetailsScreen from "../screens/PostDetailsScreen";
import PostFormScreen from "../screens/PostFormScreen";
import AdminProtectedScreen from "../screens/AdminProtectedScreen";
import UserManagementProtectedScreen from "../screens/UserManagementProtectedScreen";
import UserFormScreen from "../screens/UserFormScreen";
import CreateProfessorScreen from "../screens/CreateProfessorScreen";
import StudentScreen from "../screens/StudentScreen";
import StudentManagementProtectedScreen from "../screens/StudentManagementProtectedScreen";
import colors from "../theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: user
          ? { backgroundColor: colors.white, borderTopColor: colors.border }
          : { display: "none" },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "Posts":
              return <Ionicons name="newspaper-outline" size={size} color={color} />;
            case "Admin":
              return <Ionicons name="settings-outline" size={size} color={color} />;
            case "Professores":
              return <Ionicons name="school-outline" size={size} color={color} />;
            case "Alunos":
            case "AlunosAdmin":
              return <Ionicons name="people-outline" size={size} color={color} />;
            default:
              return <Ionicons name="apps-outline" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Posts" component={PostsListScreen} options={{ title: "Início" }} />
      {user?.role === "professor" && (
        <>
          <Tab.Screen
            name="Admin"
            component={AdminProtectedScreen}
            options={{ title: "Gerenciar posts" }}
          />
          <Tab.Screen
            name="Professores"
            component={UserManagementProtectedScreen}
            component={ProfessoresListProtectedScreen}
            options={{ title: "Professores", unmountOnBlur: true }}
          />
          <Tab.Screen
            name="AlunosAdmin"
            component={StudentManagementProtectedScreen}
            options={{ title: "Alunos", unmountOnBlur: true }}
          />
        </>
      )}

      {user?.role === "aluno" && (
        <Tab.Screen name="Alunos" component={StudentScreen} options={{ title: "Alunos" }} />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const isProfessor = user?.role === "professor";

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        // A tela inicial do app deve ser a escolha de usuário.
        // Mesmo com sessão salva, o usuário pode optar por continuar ou trocar.
        initialRouteName="Login"
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "left",
          headerTitle: "Blog Escolar",
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerRight: () => <HeaderLogoutButton />,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "Blog Escolar",
            headerRight: () => null,
            headerBackVisible: false,
          }}
        />

        {/* Rotas privadas: exibidas somente quando existe usuário autenticado. */}
        {user && (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ title: "Blog Escolar" }} />
            <Stack.Screen
              name="PostDetails"
              component={PostDetailsScreen}
              options={{ title: "Blog Escolar" }}
            />
            {isProfessor && (
              <>
                <Stack.Screen name="PostForm" component={PostFormScreen} options={{ title: "Blog Escolar" }} />
                <Stack.Screen name="UserForm" component={UserFormScreen} options={{ title: "Blog Escolar" }} />
                <Stack.Screen
                  name="CreateProfessor"
                  component={CreateProfessorScreen}
                  options={{ title: "Blog Escolar" }}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
