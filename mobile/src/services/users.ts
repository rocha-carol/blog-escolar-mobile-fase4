// Importa módulo para requisições à API
import api from "./api";
import type { PaginatedResponse, User, UserRole } from "../types";

// Cria um novo usuário (professor ou aluno)
export async function createUser(payload:
  | {
      nome: string;
      email: string;
      role: "professor";
    }
  | {
      nome: string;
      role: "aluno";
      rm: string;
    }
): Promise<User> {
  const response = await api.post(`/usuarios`, payload);
  return response.data.usuario;
}

// Busca lista de usuários com filtros e paginação
export async function fetchUsers(params: {
  role: UserRole;
  termo?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();
  searchParams.set("role", params.role);
  if (params.termo?.trim()) searchParams.set("termo", params.termo.trim());
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const response = await api.get(`/usuarios?${searchParams.toString()}`);
  const data = response.data;

  return {
    items: data.usuarios ?? [],
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 0,
    hasMore: data.hasMore ?? false,
  };
}

// Busca um usuário pelo id
export async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`/usuarios/${id}`);
  return response.data.usuario;
}

// Atualiza dados de um usuário
export async function updateUser(id: string, payload: {
  nome: string;
  role: UserRole;
  email?: string;
  rm?: string;
  senha?: string;
}): Promise<User> {
  const response = await api.put(`/usuarios/${id}`, payload);
  return response.data.usuario;
}

// Remove um usuário pelo id
export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}
