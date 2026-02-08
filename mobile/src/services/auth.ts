import api from "./api";
import type { User } from "../types";

export type LoginResponse = {
  message: string;
  firstAccess?: boolean;
  usuario: {
    id: string;
    nome: string;
    email?: string;
    rm?: string;
    role: "professor" | "aluno";
  };
};

export async function login(email: string, senha: string): Promise<{ user: User; firstAccess?: boolean }> {
  const response = await api.post<LoginResponse>("/usuario/login", { email, senha });
  return { user: response.data.usuario, firstAccess: response.data.firstAccess };
}

export type StudentLoginResponse = {
  message: string;
  usuario: {
    id: string;
    nome: string;
    rm: string;
    role: "aluno";
  };
};

export async function loginAluno(nome: string, rm: string): Promise<User> {
  const response = await api.post<StudentLoginResponse>("/usuario/login-aluno", { nome, rm });
  return response.data.usuario;
}

export async function registerUser(payload: {
  nome: string;
  email: string;
  senha: string;
  role: "professor" | "aluno";
}): Promise<User> {
  const response = await api.post("/usuario/registro", payload);
  return response.data.Usuario;
}
