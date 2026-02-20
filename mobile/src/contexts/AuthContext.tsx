// Importa AsyncStorage para salvar dados localmente e React para hooks/contexto
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginService, loginAluno as loginAlunoService } from "../services/auth";
import type { User } from "../types";

// Define o formato dos dados do contexto de autenticação
// user: usuário logado
// credentials: email e senha salvos
// loading: indica se está carregando
// login: função para login de professor
// continueAsStudent: função para login de aluno
// logout: função para sair

type AuthContextData = {
  user: User | null;
  credentials: { email: string; senha: string } | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ firstAccess?: boolean }>;
  continueAsStudent: (nome: string, rm: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextData | undefined>(undefined);

// Provider que envolve o app e fornece o contexto de autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; senha: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega usuário e credenciais salvos ao iniciar o app
  useEffect(() => {
    const bootstrap = async () => {
      const storedUser = await AsyncStorage.getItem("auth_user");
      const storedCredentials = await AsyncStorage.getItem("auth_credentials");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedCredentials) {
        setCredentials(JSON.parse(storedCredentials));
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  // Função para login de professor
  const login = useCallback(async (email: string, senha: string) => {
    const { user: loggedUser, firstAccess } = await loginService(email, senha);
    setUser(loggedUser);
    setCredentials({ email, senha });
    await AsyncStorage.setItem("auth_user", JSON.stringify(loggedUser));
    await AsyncStorage.setItem("auth_credentials", JSON.stringify({ email, senha }));
    return { firstAccess };
  }, []);

  // Função para login de aluno
  const continueAsStudent = useCallback(async (nome: string, rm: string) => {
    const aluno = await loginAlunoService(nome, rm);

    setUser(aluno);
    setCredentials(null);
    await AsyncStorage.setItem("auth_user", JSON.stringify(aluno));
    await AsyncStorage.removeItem("auth_credentials");
  }, []);

  // Função para logout (sair do app)
  const logout = useCallback(async () => {
    setUser(null);
    setCredentials(null);
    await AsyncStorage.multiRemove(["auth_user", "auth_credentials"]);
  }, []);

  // Monta o valor do contexto para ser usado nos componentes
  const value = useMemo(
    () => ({ user, credentials, loading, login, continueAsStudent, logout }),
    [user, credentials, loading, login, continueAsStudent, logout]
  );

  // Retorna o provider com o valor do contexto
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
