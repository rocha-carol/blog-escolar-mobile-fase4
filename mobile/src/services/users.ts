import api from "./api";
import type { PaginatedResponse, User, UserRole } from "../types";

export async function fetchUsers(params: {
  role: UserRole;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();
  searchParams.set("role", params.role);
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
  const response = await api.get(`/usuarios/${id}`);
  return response.data.usuario;
}

export async function updateUser(id: string, payload: {
  nome: string;
  email: string;
  role: UserRole;
  senha?: string;
}): Promise<User> {
  const response = await api.put(`/usuarios/${id}`, payload);
  return response.data.usuario;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}
