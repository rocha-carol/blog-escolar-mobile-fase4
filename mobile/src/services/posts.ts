import api from "./api";
import type { Post, PaginatedResponse } from "../types";

export async function fetchPosts(params?: {
  page?: number;
  limit?: number;
  termo?: string;
}): Promise<PaginatedResponse<Post>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.termo) searchParams.set("palavra", params.termo);

  const url = params?.termo ? `/posts/search?${searchParams.toString()}` : `/posts?${searchParams.toString()}`;
  const response = await api.get(url);
  const data = response.data;

  return {
    items: data.posts ?? data.resultados ?? [],
    total: data.total ?? (data.resultados?.length ?? 0),
    page: data.page ?? 1,
    limit: data.limit ?? (data.resultados?.length ?? 0),
    hasMore: data.hasMore ?? false,
  };
}

export async function fetchPost(id: string): Promise<Post> {
  const response = await api.get(`/posts/${id}`);
  return response.data;
}

export async function createPost(payload: {
  titulo: string;
  conteudo: string;
  autoria: string;
  areaDoConhecimento?: string;
}): Promise<Post> {
  const response = await api.post("/posts", payload);
  return response.data;
}

export async function updatePost(id: string, payload: {
  titulo: string;
  conteudo: string;
  autoria: string;
  areaDoConhecimento?: string;
}): Promise<Post> {
  const response = await api.put(`/posts/${id}`, payload);
  return response.data;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}
