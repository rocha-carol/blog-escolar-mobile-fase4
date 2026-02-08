import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginService, loginAluno as loginAlunoService } from "../services/auth";
import type { User } from "../types";

type AuthContextData = {
  user: User | null;
  credentials: { email: string; senha: string } | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ firstAccess?: boolean }>;
  continueAsStudent: (nome: string, rm: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; senha: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

  const login = useCallback(async (email: string, senha: string) => {
    const { user: loggedUser, firstAccess } = await loginService(email, senha);
    setUser(loggedUser);
    setCredentials({ email, senha });
    await AsyncStorage.setItem("auth_user", JSON.stringify(loggedUser));
    await AsyncStorage.setItem("auth_credentials", JSON.stringify({ email, senha }));
    return { firstAccess };
  }, []);

  const continueAsStudent = useCallback(async (nome: string, rm: string) => {
    const aluno = await loginAlunoService(nome, rm);

    setUser(aluno);
    setCredentials(null);
    await AsyncStorage.setItem("auth_user", JSON.stringify(aluno));
    await AsyncStorage.removeItem("auth_credentials");
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setCredentials(null);
    await AsyncStorage.multiRemove(["auth_user", "auth_credentials"]);
  }, []);

  const value = useMemo(
    () => ({ user, credentials, loading, login, continueAsStudent, logout }),
    [user, credentials, loading, login, continueAsStudent, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
