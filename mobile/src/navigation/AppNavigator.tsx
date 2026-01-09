import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import PostsListScreen from "../screens/PostsListScreen";
import PostDetailsScreen from "../screens/PostDetailsScreen";
import PostFormScreen from "../screens/PostFormScreen";
import AdminPostsScreen from "../screens/AdminPostsScreen";
import UsersListScreen from "../screens/UsersListScreen";
import UserFormScreen from "../screens/UserFormScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user } = useAuth();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Posts" component={PostsListScreen} />
      {user?.role === "professor" && (
        <>
          <Tab.Screen name="Admin" component={AdminPostsScreen} />
          <Tab.Screen
            name="Professores"
            children={() => <UsersListScreen role="professor" />}
          />
          <Tab.Screen name="Alunos" children={() => <UsersListScreen role="aluno" />} />
        </>
      )}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="PostDetails" component={PostDetailsScreen} options={{ title: "Post" }} />
            <Stack.Screen name="PostForm" component={PostFormScreen} options={{ title: "Postagem" }} />
            <Stack.Screen name="UserForm" component={UserFormScreen} options={{ title: "Usuário" }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
