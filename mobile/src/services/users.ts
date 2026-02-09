import api, { assertProfessorPermission } from "./api";
import type { PaginatedResponse, User, UserRole } from "../types";

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
  await assertProfessorPermission();
  const response = await api.post(`/usuarios`, payload);
  return response.data.usuario;
}

export async function fetchUsers(params: {
  role: UserRole;
  termo?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> {
  await assertProfessorPermission();

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

export async function fetchUser(id: string): Promise<User> {
  await assertProfessorPermission();
  const response = await api.get(`/usuarios/${id}`);
  return response.data.usuario;
}

export async function updateUser(id: string, payload: {
  nome: string;
  role: UserRole;
  email?: string;
  rm?: string;
  senha?: string;
}): Promise<User> {
  await assertProfessorPermission();
  const response = await api.put(`/usuarios/${id}`, payload);
  return response.data.usuario;
}

export async function deleteUser(id: string): Promise<void> {
  await assertProfessorPermission();
  await api.delete(`/usuarios/${id}`);
}
