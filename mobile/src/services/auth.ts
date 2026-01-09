import api from "./api";
import type { User } from "../types";

export type LoginResponse = {
  message: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    role: "professor" | "aluno";
  };
};

export async function login(email: string, senha: string): Promise<User> {
  const response = await api.post<LoginResponse>("/usuario/login", { email, senha });
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
