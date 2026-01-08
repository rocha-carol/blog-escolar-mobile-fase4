import React, { createContext, useState } from "react";
import { loginService } from "../services/authService";
import type { ChildrenProps } from "../interfaces/children";

// 1. Define o formato dos dados do contexto
type UserType = {
  id: string;
  nome: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: UserType | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

// 2. Cria o contexto com valor inicial "undefined"
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider que vai envolver a aplicação
export const AuthProvider: React.FC<ChildrenProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Tenta carregar token/user do localStorage ao iniciar
  React.useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser && savedUser !== "undefined") {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser) as UserType);
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Função de login real
  const login = async (email: string, password: string) => {
    const response = await loginService(email, password);
    setToken(response.token);
    setUser(response.usuario);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.usuario));
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
