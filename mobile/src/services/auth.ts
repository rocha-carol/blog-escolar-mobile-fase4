// Importa a configuração da API e o tipo User
import api from "./api";
import type { User } from "../types";

// Tipo da resposta do login de professor
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

// Faz login de professor usando email e senha
export async function login(email: string, senha: string): Promise<{ user: User; firstAccess?: boolean }> {
  const response = await api.post<LoginResponse>("/usuario/login", { email, senha });
  // Retorna usuário e se é o primeiro acesso
  return { user: response.data.usuario, firstAccess: response.data.firstAccess };
}

// Tipo da resposta do login de aluno
export type StudentLoginResponse = {
  message: string;
  usuario: {
    id: string;
    nome: string;
    rm: string;
    role: "aluno";
  };
};

// Faz login de aluno usando nome e RM
export async function loginAluno(nome: string, rm: string): Promise<User> {
  const response = await api.post<StudentLoginResponse>("/usuario/login-aluno", { nome, rm });
  // Retorna usuário do tipo aluno
  return response.data.usuario;
}

// Registra novo usuário (professor ou aluno)
export async function registerUser(payload: {
  nome: string;
  email: string;
  senha: string;
  role: "professor" | "aluno";
}): Promise<User> {
  const response = await api.post("/usuario/registro", payload);
  // Retorna usuário cadastrado
  return response.data.Usuario;
}
