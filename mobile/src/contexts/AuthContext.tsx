// Importa AsyncStorage para salvar dados localmente e React para hooks/contexto
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginService, loginAluno as loginAlunoService } from "../services/auth";
import type { User } from "../types";

type Credentials = { email: string; senha: string };

type AuthContextData = {
  user: User | null;
  credentials: Credentials | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ user: User; firstAccess?: boolean }>;
  continueAsStudent: (nome: string, rm: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AUTH_USER_KEY = "auth_user";
const AUTH_CREDENTIALS_KEY = "auth_credentials";

const AuthContext = createContext<AuthContextData | undefined>(undefined);

// Provider que envolve o app e fornece o contexto de autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega usuário e credenciais salvos ao iniciar o app
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storedUser, storedCredentials] = await AsyncStorage.multiGet([
          AUTH_USER_KEY,
          AUTH_CREDENTIALS_KEY,
        ]);

        const userValue = storedUser[1];
        const credentialsValue = storedCredentials[1];

        if (!userValue) {
          return;
        }

        const parsedUser = JSON.parse(userValue) as User;
        if (parsedUser.role !== "professor" && parsedUser.role !== "aluno") {
          await AsyncStorage.multiRemove([AUTH_USER_KEY, AUTH_CREDENTIALS_KEY]);
          return;
        }

        setUser(parsedUser);

        if (parsedUser.role === "professor" && credentialsValue) {
          setCredentials(JSON.parse(credentialsValue) as Credentials);
        }
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  // Função para login de professor
  const login = useCallback(async (email: string, senha: string) => {
    const { user: loggedUser, firstAccess } = await loginService(email, senha);

    setUser(loggedUser);
    setCredentials({ email, senha });

    await AsyncStorage.multiSet([
      [AUTH_USER_KEY, JSON.stringify(loggedUser)],
      [AUTH_CREDENTIALS_KEY, JSON.stringify({ email, senha })],
    ]);

    return { user: loggedUser, firstAccess };
  }, []);

  // Função para login de aluno
  const continueAsStudent = useCallback(async (nome: string, rm: string) => {
    const aluno = await loginAlunoService(nome, rm);

    setUser(aluno);
    setCredentials(null);

    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(aluno));
    await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
  }, []);

  // Função para logout (sair do app)
  const logout = useCallback(async () => {
    setUser(null);
    setCredentials(null);
    await AsyncStorage.multiRemove([AUTH_USER_KEY, AUTH_CREDENTIALS_KEY]);
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
